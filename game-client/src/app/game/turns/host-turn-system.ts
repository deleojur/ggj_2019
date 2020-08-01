import { TurnsSystem } from './turns-system';
import { GameManager } from '../game-manager';
import { hostState_clientTurnConfirm } from '../states/host-states/host-state_client-turn-confirm';
import { TurnConfirmData, ClientData, TurnInformationData, RequestData } from '../states/request-data';
import { Graphics } from 'pixi.js';
import { hostState_turnInformation } from '../states/host-states/host-state_turn-information';
import { TurnInformation, TurnCommand } from './turn-command';
import { Cell } from '../grid/grid';
import { Hex } from 'honeycomb-grid';
import { Entity } from '../entities/entity';
import { Resource } from '../entities/resource';
import { ResourceManager } from '../components/resourceManager';
import { hostState_turnResolve } from '../states/host-states/host-state_turn-resolve';

export class HostTurnSystem extends TurnsSystem
{
	private clientDataReceived: Map<string, boolean>;
	private _clients: ClientData[];

	public init(graphics: Graphics)
	{
		super.init(graphics);
		this.clientDataReceived = new Map<string, boolean>();
	}

	private setClientDataReceivedFalse(): void
	{
		this._clients.forEach(client =>
		{
			this.clientDataReceived.set(client.id, false);
		});
	}

	public onGameStarted(): void
	{
		this._clients = GameManager.instance.hostStateHandler.clients.slice();
		this.onRoundStarted();
	}

	public onCountdownFinished(): void
	{
		this.onRoundEnded();
	}

	//called when the game starts or when all the turns have been resolved.
	protected onRoundStarted(): void
	{
		this.setClientDataReceivedFalse();

		//the text in the host hud component is replaced with -> x time to enter turn info.
		GameManager.instance.hostStateHandler.activateState<TurnConfirmData>(hostState_clientTurnConfirm, (turnConfirmData) =>
		{
			this.onClientConfirmedTurn(turnConfirmData);
		}, false);
	}

	//called either when the countdown runs to 0 or when all players have locked in their actions.
	protected onRoundEnded(): void
	{
		//the text in the host hud component is replaced with -> resolving turns
		//go to state resolving turns.
		this.setClientDataReceivedFalse();
		const requestTurnInformation: hostState_turnInformation =
		GameManager.instance.hostStateHandler.activateState<TurnInformationData>(hostState_turnInformation, (turnInformation) =>
		{
			this.onClientSharedTurnInformation(turnInformation);
		}, false) as hostState_turnInformation;
		requestTurnInformation.doRequestTurnInformation();
	}

	private get receivedDataForAllClients(): boolean
	{
		const values: boolean[] = Array.from(this.clientDataReceived.values());
		for (let i: number = 0; i < values.length; i++)
		{
			if (!values[i])
			{
				return false;
			}
		}
		return true;
	}

	//called when a client locked their turn. Also called when a client decides to unlock their turn again.
	private onClientConfirmedTurn(turnConfirmed: TurnConfirmData): void
	{
		this.clientDataReceived.set(turnConfirmed.id, turnConfirmed.turnConfirmed);
		if (this.receivedDataForAllClients)
		{
			this.onRoundEnded();
		}		
	}

	private onClientSharedTurnInformation(turnInformationData: TurnInformationData): void
	{
		this.clientDataReceived.set(turnInformationData.id, true);
		this.addTurnInformationFromCommanData(turnInformationData);

		if (this.receivedDataForAllClients)
		{
			this.resolveTurn();
		}
	}

	private resolveTurn(): void
	{
		this.setClientDataReceivedFalse();

		//TODO: also send the commands that were invalid.
		const validTurnCommands: TurnCommand[] = this.resolveTurnInformation();
		const newResources: Map<string, Resource[]> = this.resolveResources();

		this._clients.forEach(client =>
		{
			const turnResolve: hostState_turnResolve =
			GameManager.instance.hostStateHandler.activateState<RequestData>(
				hostState_turnResolve, (verifyTurnResolve: RequestData) =>
			{
				this.clientDataReceived.set(verifyTurnResolve.id, true);

				if (this.receivedDataForAllClients)
				{
					//TODO: advance to the next turn.
				}
			}, false) as hostState_turnResolve;
			turnResolve.doRequestTurnResolve(client.id, this.exportCommands(validTurnCommands), newResources.get(client.id));
		});
		this._turnCommands.clear();
		GameManager.instance.renderCellsOutline();
	}

	private resolveTurnInformation(): TurnCommand[]
	{
	 	// TODO: first, apply all the entity commands -> commands that are put on entities rather than on cells.
		const turnCommands: Map<string, TurnCommand[]> = this.getAllTurnCommands();
		const validTurnCommands: TurnCommand[] = [];

		this._clients.forEach(client =>
		{
			const clientCommands: TurnCommand[] = turnCommands.get(client.id);
			clientCommands.forEach(clientCommand =>
			{
				const clientTurnInformation: TurnInformation = clientCommand.turnInformation;
				const otherCommands: TurnInformation[] = this.getTurnInformation(clientCommand.turnInformation.targetCell).slice();
				const indexOf: number = otherCommands.indexOf(clientTurnInformation);
				otherCommands.splice(indexOf, 1);

				if (this._resolveTurnCommand.tryToResolveTurnCommand(clientCommand, otherCommands))
				{
					validTurnCommands.push(clientCommand);
				}
			});
		});
		return validTurnCommands;
	}

	private resolveResources(): Map<string, Resource[]>
	{
		const resources: Map<string, Resource[]> = new Map<string, Resource[]>();
		const entities: Map<string, Entity[]> = GameManager.instance.gridStrategy.getAllEntities();
		this._clients.forEach(client => 
		{
			const resourceManager: ResourceManager = new ResourceManager();
			resourceManager.init(0, 0, 0);
			const clientEntities: Entity[] = entities.get(client.id);
			clientEntities.forEach(entity =>
			{
				resourceManager.addResource(entity.upkeep);
			});
			resources.set(client.id, resourceManager.resourcePool);
		});
		return resources;
	}

	public getAllTurnCommands(): Map<string, TurnCommand[]>
	{
		const turnCommands: Map<string, TurnCommand[]> = new Map<string, TurnCommand[]>();
		const allCommands = Array.from(this._turnCommands.values());
		allCommands.forEach(turnCommandArray =>
		{
			turnCommandArray.forEach(turnCommand =>
			{
				const owner: string = turnCommand.owner;
				if (!turnCommands.has(owner))
				{
					turnCommands.set(owner, []);
				} 
				turnCommands.get(owner).push(turnCommand);
			});
		});
		return turnCommands;
	}

	//whenever a client has 
	public onClientTurnInfoRetrieved(): void
	{

	}
}
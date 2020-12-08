import { TurnsSystem } from './turns-system';
import { GameManager } from '../game-manager';
import { hostState_clientTurnConfirm } from '../states/host-states/host-state_client-turn-confirm';
import { TurnConfirmData, ClientData, TurnInformationData, RequestData } from '../states/request-data';
import { Graphics } from 'pixi.js';
import { hostState_turnInformation } from '../states/host-states/host-state_turn-information';
import { TurnInformation, TurnCommand } from './turn-command';
import { Entity } from '../entities/entity';
import { Resource } from '../entities/resource';
import { ResourceManager } from '../components/resourceManager';
import { hostState_turnResolve, ResolvedTurnCommand } from '../states/host-states/host-state_turn-resolve';

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
		console.log('start a new round!');
		this.setClientDataReceivedFalse();

		//the text in the host hud component is replaced with -> x time to enter turn info.
		const clientTurnConfirm: hostState_clientTurnConfirm =
		GameManager.instance.hostStateHandler.activateState<TurnConfirmData>(hostState_clientTurnConfirm, (turnConfirmData) =>
		{
			this.onClientConfirmedTurn(turnConfirmData);
		}, false) as hostState_clientTurnConfirm;
		clientTurnConfirm.requestNextTurn();
	}

	//called either when the countdown runs to 0 or when all players have locked in their actions.
	protected onRoundEnded(): void
	{
		console.log('round has ended!');
		//the text in the host hud component is replaced with -> resolving turns
		//go to state resolving turns.
		this.setClientDataReceivedFalse();
		const requestTurnInformation: hostState_turnInformation =
		GameManager.instance.hostStateHandler.activateState<TurnInformationData>(hostState_turnInformation, (turnInformation) =>
		{
			this.clientDataReceived.set(turnInformation.id, true);
			this.addTurnInformationFromCommandData(turnInformation);

			if (this.receivedDataForAllClients)
			{
				GameManager.instance.hostStateHandler.deactivateState(hostState_turnInformation);
				this.resolveTurn();
			}
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

	protected hostResetTurnCommandsRender(): void
	{
		this.removeRenderCommands();
		this.resetTurnCommandsRender(turnCommand =>
		{
			this._renderCommands.push(turnCommand);
		});
	}

	private resolveTurn(): void
	{
		this.setClientDataReceivedFalse();
		const resources: Map<string, Resource[]> = this.resolveResources();

		const turnResolve: hostState_turnResolve =
		GameManager.instance.hostStateHandler.activateState<RequestData>(
			hostState_turnResolve, (verifyTurnResolve: RequestData) =>
		{
			this.clientDataReceived.set(verifyTurnResolve.id, true);

			if (this.receivedDataForAllClients)
			{
				this.onRoundStarted();
			}
		}, false) as hostState_turnResolve;
		turnResolve.handleTurns(this._resolveTurnCommand, (successfulTurnCommands, unsuccessfulTurnCommands) =>
		{
			console.log('successful:', successfulTurnCommands, 'unsuccessful:', unsuccessfulTurnCommands);
			this.resetTurnCommands();
			this._clients.forEach(client =>
			{
				turnResolve.doRequestTurnResolve(client.id, this.exportCommands(successfulTurnCommands,
					(turnCommand: TurnInformation) => { return turnCommand.validPathData }), resources.get(client.id));
			});
			//TODO: don't redraw everything; let the command path be drawn
			GameManager.instance.renderCellsOutline();
		});
		GameManager.instance.renderCellsOutline();
		this.hostResetTurnCommandsRender();
	}

	

	private resolveResources(): Map<string, Resource[]>
	{
		const resources: Map<string, Resource[]> = new Map<string, Resource[]>();
		const entities: Map<string, Entity[]> = GameManager.instance.gridStrategy.getAllEntities();
		this._clients.forEach(client => 
		{
			const resourceManager: ResourceManager = new ResourceManager();
			resourceManager.init(0, 0, 0, 0);
			const clientEntities: Entity[] = entities.get(client.id);
			clientEntities.forEach(entity =>
			{
				resourceManager.addResource(entity.upkeep);
			});
			resources.set(client.id, resourceManager.resourcePool);
		});
		return resources;
	}

	public getTurnInformationPerClient(): Map<string, TurnInformation[]>
	{
		const turnInformation: Map<string, TurnInformation[]> = new Map<string, TurnInformation[]>();
		const allCommands = Array.from(this._turnCommands.values());
		allCommands.forEach(turnCommandArray =>
		{
			turnCommandArray.forEach(turnCommand =>
			{
				const owner: string = turnCommand.owner;
				if (!turnInformation.has(owner))
				{
					turnInformation.set(owner, []);
				} 
				turnInformation.get(owner).push(turnCommand.turnInformation);
			});
		});
		return turnInformation;
	}

	public getAllTurnCommands(): TurnCommand[]
	{
		const turnCommands: TurnCommand[] = [];
		const allCommands = Array.from(this._turnCommands.values());
		allCommands.forEach(turnCommandArray =>
		{
			turnCommandArray.forEach(turnCommand =>
			{
				turnCommands.push(turnCommand);
			});
		});
		return turnCommands;
	}

	public getTurnCommandsByClient(): Map<string, TurnCommand[]>
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
}
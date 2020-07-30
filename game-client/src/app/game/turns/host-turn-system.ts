import { TurnsSystem } from './turns-system';
import { GameManager } from '../game-manager';
import { hostState_clientTurnConfirm } from '../states/host-states/host-state_client-turn-confirm';
import { TurnConfirmData, ClientData, TurnInformationData } from '../states/request-data';
import { Graphics } from 'pixi.js';
import { hostState_turnInformation } from '../states/host-states/host-state_turn-information';
import { TurnInformation, TurnCommand } from './turn-command';
import { Cell } from '../grid/grid';
import { Hex } from 'honeycomb-grid';
import { Entity } from '../entities/entity';

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
		//the text in the host hud component is replaced with -> x time to enter turn info.
		GameManager.instance.hostStateHandler.activateState<TurnConfirmData>(hostState_clientTurnConfirm, (turnConfirmData) =>
		{
			this.onClientConfirmedTurn(turnConfirmData);
		}, false);
		this.setClientDataReceivedFalse();
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

			//start the state that resolves the turn information.
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
		turnInformationData.turnCommands.forEach(command => 
		{
			const originCell: Hex<Cell> = GameManager.instance.grid.getHex(command.originCell.x, command.originCell.y);
			const targetCell: Hex<Cell> = GameManager.instance.grid.getHex(command.targetCell.x, command.targetCell.y);
			const entity: Entity = GameManager.instance.gridStrategy.getEntityByGuid(command.originEntityGuid);
			const turnInformation: TurnInformation = this.generateTurnInformation(originCell, targetCell, entity, command.behaviorInformation);
			this.addTurnCommand(turnInformation, turnInformationData.id);
		});

		if (this.receivedDataForAllClients)
		{
			GameManager.instance.renderCellsOutline();
		}
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
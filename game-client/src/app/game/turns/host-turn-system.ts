import { TurnsSystem } from './turns-system';
import { GameManager } from '../game-manager';
import { hostState_clientTurnConfirm } from '../states/host-states/host-state_client-turn-confirm';
import { TurnConfirmData, ClientData, TurnInformationData } from '../states/request-data';
import { Graphics } from 'pixi.js';
import { hostState_turnInformation } from '../states/host-states/host-state_turn-information';

export class HostTurnSystem extends TurnsSystem
{
	private _clientsTurns: Map<string, boolean>;
	private _clients: ClientData[];

	public init(graphics: Graphics)
	{
		super.init(graphics);
		this._clientsTurns = new Map<string, boolean>();
	}

	private setTurnConfirmedFalseForClients(): void
	{
		this._clients.forEach(client =>
		{
			this._clientsTurns.set(client.id, false);
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
		this.setTurnConfirmedFalseForClients();
	}

	//called either when the countdown runs to 0 or when all players have locked in their actions.
	protected onRoundEnded(): void
	{
		//the text in the host hud component is replaced with -> resolving turns
		//go to state resolving turns.
		this.setTurnConfirmedFalseForClients();
		const requestTurnInformation: hostState_turnInformation =
		GameManager.instance.hostStateHandler.activateState<TurnInformationData>(hostState_turnInformation, (turnInformation) =>
		{
			this.onClientSharedTurnInformation(turnInformation);

			//start the state that resolves the turn information.
		}, false) as hostState_turnInformation;
		requestTurnInformation.doRequestTurnInformation();
	}

	private getAllClientsConfirmedTurn(): boolean
	{
		const values: boolean[] = Array.from(this._clientsTurns.values());
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
		this._clientsTurns.set(turnConfirmed.id, turnConfirmed.turnConfirmed);
		let allConfirmed: boolean = this.getAllClientsConfirmedTurn();
		if (allConfirmed)
		{
			this.onRoundEnded();
		}		
	}

	private onClientSharedTurnInformation(turnInformation: TurnInformationData): void
	{
		console.log('turnInformation was received for player', turnInformation);
	}

	//whenever a client has 
	public onClientTurnInfoRetrieved(): void
	{

	}
}
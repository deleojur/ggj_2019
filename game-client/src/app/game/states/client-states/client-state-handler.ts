import { StateHandlerService } from '../state-handler.service';
import { clientState_startGame } from './client-state_start-game';
import { state_requestJoinRoom } from './state_request-join-room';
import { clientState_turnInformation } from './client-state_turn-information';
import { state_playerStartingPositions } from '../turn-state-handling/state_player-starting-positions';
import { ConnectionService } from 'src/services/connection.service';
import { Injectable } from '@angular/core';
import { ClientData } from '../request-data';
import { clientState_turnResolve } from './client-state_turn-resolve';
import { clientState_advanceToNextTurn } from './client-state_advance-to-next-turn';
import { clientState_requestCards } from './client-state_request-cards';
import { clientState_draftCards } from './client-state_draft-cards';

@Injectable({
    providedIn: 'root'
})
export class ClientStateHandler extends StateHandlerService
{
	private _clientId: string;
	constructor(connectionService: ConnectionService)
    {
        super(connectionService);
    }

	protected registerStates(): void
	{
		this._states.set(state_requestJoinRoom, new state_requestJoinRoom());
		this._states.set(clientState_startGame, new clientState_startGame());
		this._states.set(state_playerStartingPositions, new state_playerStartingPositions());
		this._states.set(clientState_turnInformation, new clientState_turnInformation());
		this._states.set(clientState_turnResolve, new clientState_turnResolve());
		this._states.set(clientState_advanceToNextTurn, new clientState_advanceToNextTurn());
		this._states.set(clientState_requestCards, new clientState_requestCards());
		this._states.set(clientState_draftCards, new clientState_draftCards());
	}

	public get clientType(): string
	{
		return 'client';
	}

	public hostSharedClients(clients: ClientData[]): void
	{
		this._clients.clear();
		clients.forEach(client =>
		{
			this._clients.set(client.id, client);
		});
	}

	public set self(client: ClientData)
	{
		this._clientId = client.id;
		this._clients.set(client.id, client);
	}

	public get self(): ClientData
	{
		return this._clients.get(this._clientId);
	}

	public get clientId(): string
	{
		return this._clientId;
	} 

	public get clientIndex(): number
	{
		return this.self.startingPosition;
	}

	public getClientColor(): number
	{
		const client: ClientData = this.getClientData();
		const color: string = client.color.replace('#', '0x');
		return parseInt(color);
	}

	public getClientData(): ClientData
	{
		return this._clients.get(this._clientId);
	}
}
import { StateHandlerService } from '../state-handler.service';
import { clientState_startGame } from 'src/app/game/states/client-states/client-state_start-game';
import { state_requestJoinRoom } from 'src/app/game/states/client-states/state_request-join-room';
import { state_playerStartingPositions } from 'src/app/game/states/turn-state-handling/state_player-starting-positions';
import { ConnectionService } from 'src/services/connection.service';
import { Injectable } from '@angular/core';
import { ClientData } from '../request-data';

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

	public getColor(): number
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
import { StateHandlerService } from '../state-handler.service';

import { state_requestRoom } from 'src/app/game/states/host-states/state_request-room';
import { state_clientConnection } from './state_client-connection';
import { hostState_startGame } from 'src/app/game/states/host-states/host-state_start-game';
import { Injectable } from '@angular/core';
import { ConnectionService } from 'src/services/connection.service';
import { ClientData, RoomData } from '../request-data';

@Injectable({
    providedIn: 'root'
})
export class HostStateHandler extends StateHandlerService
{
	private _room: RoomData;
	public get room(): RoomData
	{
		return this._room;
	}

	constructor(connectionService: ConnectionService)
    {
		super(connectionService);
    }

	protected registerStates(): void
	{
		this._states.set(state_requestRoom, new state_requestRoom());
        this._states.set(hostState_startGame, new hostState_startGame());
		this._states.set(state_clientConnection, new state_clientConnection());
	}

	public roomJoined(room: RoomData): void
	{
		this._room = room;
	}

	public clientJoinedGame(client: ClientData): void
	{
		if (client.status === 'joined')
		{
			this._clients.set(client.id, client);
		}
		else
		{
			this._clients.delete(client.id);
		}
	}

	public mapOwnerId(): void
	{
		const clients: number[] = [];
		for (let i = 0; i < this._clients.size; i++)
		{
			clients.push(i);
		}

		this._clients.forEach(client =>
		{
			const index: number = Math.floor(Math.random() * clients.length);
			client.startingPosition = clients[index];
			clients.splice(index, 1);
		});
	}
}
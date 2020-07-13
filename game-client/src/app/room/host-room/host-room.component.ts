import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

import { RequestData, RoomData, ClientData } from '../../game/states/request-data';
import { state_requestRoom } from '../../game/states/host-states/state_request-room';
import { state_clientConnection } from '../../game/states/host-states/state_client-connection';
import { hostState_startGame } from 'src/app/game/states/host-states/host-state_start-game';
import { HostStateHandler } from 'src/app/game/states/host-states/host-state-handler';
import { GameManager } from 'src/app/game/game-manager';

@Component({
  selector: 'app-host-room',
  templateUrl: './host-room.component.html',
  styleUrls: ['./host-room.component.scss']
})
export class HostRoomComponent implements OnInit 
{
	clients: ClientData[] = [];
	maxPlayers: number;

    constructor(
        public hostStateHandler: HostStateHandler,
        private router: Router) { }
    
    ngOnInit() 
    {
		GameManager.instance.init(this.hostStateHandler, () =>
		{
			this.maxPlayers = GameManager.instance.grid.maxPlayerNumber;
		});
		this.doRequest();
    }

    doRequest()
    {
		/**
		 * 1) wait for the roomdata request to resolve
		 * 2) then wait for players to join (clientConnection) and for one of those players to start the gane (startGame)
		*/

        const stateRequestRoom: state_requestRoom = this.hostStateHandler.activateState<RoomData>(state_requestRoom, (roomData) =>
        {
			this.hostStateHandler.roomJoined(roomData);
            this.hostStateHandler.activateState<ClientData>(state_clientConnection, (clientData) =>
            {
				this.hostStateHandler.clientJoinedGame(clientData);
				this.clients = this.hostStateHandler.clients;
            });

            const stateRequestStartGame: hostState_startGame = this.hostStateHandler.activateState<RequestData>(hostState_startGame, (data) =>
            {
				//TODO: display player X started the game!
				this.hostStateHandler.mapOwnerId();
				
				stateRequestStartGame.doRequestStartGame(this.hostStateHandler.clients);
                this.router.navigate(['game/host']);
			}, true) as hostState_startGame;
			
        }, true) as state_requestRoom;
        stateRequestRoom.doRequestCreateRoom();
    }
}

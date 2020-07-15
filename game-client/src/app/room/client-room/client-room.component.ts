import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { clientState_startGame } from '../../game/states/client-states/client-state_start-game';

import { state_requestJoinRoom } from '../../game/states/client-states/state_request-join-room';
import { ClientData, HostStartGameData } from '../../game/states/request-data';
import { ClientStateHandler } from 'src/app/game/states/client-states/client-state-handler';
import { GameManager } from 'src/app/game/game-manager';
import { GridClient } from 'src/app/game/grid/client-grid';

@Component({
  selector: 'app-client-room',
  templateUrl: './client-room.component.html',
  styleUrls: ['./client-room.component.scss']
})
export class ClientRoomComponent implements OnInit 
{
    private stateStartGame: clientState_startGame;

    constructor(
        public clientStateHandler: ClientStateHandler,
        private router: Router) { }
    
    ngOnInit() 
    {
		const clientGrid: GridClient = new GridClient(this.clientStateHandler);
		GameManager.instance.init(clientGrid, () => {});
    }

    joinRoom(f: NgForm): void
    {
        if (f.valid)
        {
            const name: string = f.value.name;
            const roomid: string = f.value.roomid;

            const stateJoinRoom: state_requestJoinRoom =
            this.clientStateHandler.activateState<ClientData>(state_requestJoinRoom, (clientData) =>
            {
				this.clientStateHandler.self = clientData;
                this.stateStartGame = this.clientStateHandler.activateState<HostStartGameData>(clientState_startGame, (startGameData) =>
                {
					//fill the map with all the player data.
					this.clientStateHandler.hostSharedClients(startGameData.clients);
					GameManager.instance.gridStrategy.createStartEntities(startGameData.clients);

                    this.router.navigate(['game/client']);
				}, true) as clientState_startGame;
				
            }, true) as state_requestJoinRoom;
            stateJoinRoom.doRequestJoinRoom(roomid, name);
        }
    }

    startGame(): void
    {
        this.stateStartGame.doRequestStartGame();
    }
}

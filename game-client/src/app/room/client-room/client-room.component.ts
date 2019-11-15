import { ClientUtilsService } from './../../../services/utils/client-utils.service';
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { state_startGame } from './../../game/states/state_start-game';
import { StateHandlerService } from 'src/services/state-handler.service';

import { state_requestJoinRoom } from '../../game/states/client-states/state_request-join-room';
import { ClientData, RequestData } from '../../game/states/request-data';

@Component({
  selector: 'app-client-room',
  templateUrl: './client-room.component.html',
  styleUrls: ['./client-room.component.scss']
})
export class ClientRoomComponent implements OnInit 
{
    clientData: ClientData;
    private stateStartGame: state_startGame;

    constructor(
        private stateHandler: StateHandlerService,
        private clientUtilsService: ClientUtilsService,
        private router: Router) { }
    
    ngOnInit() 
    {
    }

    joinRoom(f: NgForm): void
    {
        if (f.valid)
        {
            const name: string = f.value.name;
            const roomid: string = f.value.roomid;

            const stateJoinRoom: state_requestJoinRoom = 
            this.stateHandler.activateState<ClientData>(state_requestJoinRoom, (clientData) =>
            {
                this.clientData = clientData;
                this.stateStartGame = this.stateHandler.activateState<RequestData>(state_startGame, (requestData) =>
                {
                    this.stateHandler.deactivateState(state_requestJoinRoom);
                    this.stateHandler.deactivateState(state_startGame);
                    this.clientUtilsService.client = this.clientData;
                    this.router.navigate(['game/client']);
                }) as state_startGame;
            }) as state_requestJoinRoom;
            stateJoinRoom.doRequestJoinRoom(roomid, name);
        }
    }

    startGame(): void
    {
        this.stateStartGame.doRequestStartGame();
    }
}

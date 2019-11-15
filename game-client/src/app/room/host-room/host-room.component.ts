import { Router } from '@angular/router';
import { StateHandlerService } from 'src/services/state-handler.service';
import { Component, OnInit } from '@angular/core';
import { HostUtilsService } from 'src/services/utils/host-utils.service';

import { RequestData, RoomData, ClientData } from '../../game/states/request-data';
import { state_requestRoom } from '../../game/states/host-states/state_request-room';
import { state_clientConnection } from '../../game/states/host-states/state_client-connection';
import { state_startGame } from 'src/app/game/states/state_start-game';

@Component({
  selector: 'app-host-room',
  templateUrl: './host-room.component.html',
  styleUrls: ['./host-room.component.scss']
})
export class HostRoomComponent implements OnInit 
{
    room: RoomData;
    clients: ClientData[] = [];

    constructor(
        private stateHandler: StateHandlerService,
        private hostUtilsService: HostUtilsService,
        private router: Router) { }
    
    ngOnInit() 
    {
        this.doRequest();
    }

    doRequest()
    {
        const stateRequestRoom = this.stateHandler.activateState<RoomData>(state_requestRoom, (data) =>
        {
            this.stateHandler.deactivateState(state_requestRoom);

            this.room = data;
            this.stateHandler.activateState<ClientData>(state_clientConnection, (clientData) =>
            {
                if (clientData.status === 'joined')
                {
                    this.clients.push(clientData);
                }
                else
                {
                    this.removeDisconnectedClient(clientData);
                }
            });

            this.stateHandler.activateState<RequestData>(state_startGame, (data) =>
            {
                this.hostUtilsService.clients = this.clients;
                this.hostUtilsService.room = this.room;
                this.router.navigate(['game/host']);
            });
        }) as state_requestRoom;
        stateRequestRoom.doRequestCreateRoom();
    }

    removeDisconnectedClient(clientData: ClientData)
    {
        for (let i = this.clients.length - 1; i >= 0; i--)
        {
            const id: string = this.clients[i].id;
            if (clientData.id === id)
            {
                this.clients.splice(i, 1);
                break;
            }
        }
    }
}

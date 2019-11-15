import { HostUtilsService } from 'src/services/utils/host-utils.service';
import { Component, OnInit } from '@angular/core';

import { StateHandlerService } from 'src/services/state-handler.service';
import { ClientData } from '../../states/request-data';
import { state_playerStartingPositions } from '../../states/turn-state-handling/state_player-starting-positions';
import { Game } from '../game.component';

@Component({
  selector: 'app-host-game',
  template: '',
  styles: []
})
export class HostGameComponent implements Game
{
    constructor(
        private stateHandlerService: StateHandlerService,
        private hostUtilsService: HostUtilsService) { }

    onMapLoaded(): void
    {
        const clients: ClientData[] = this.hostUtilsService.clients;
        const roomid: string = this.hostUtilsService.roomid;

        const statePlayerStartPosition: state_playerStartingPositions = 
        this.stateHandlerService.getState(state_playerStartingPositions) as state_playerStartingPositions;

        statePlayerStartPosition.doRequestPlayerStartPositions({ clients: clients, roomid: roomid });
    }
}

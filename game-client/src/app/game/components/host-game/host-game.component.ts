import { Component, OnInit } from '@angular/core';

import { Game } from '../game.component';
import { HostStateHandler } from '../../states/host-states/host-state-handler';
import { StateHandlerService } from '../../states/state-handler.service';
import { RequestCardData } from '../../states/request-data';
import { hostState_responseCard } from '../../states/host-states/host-state_response-card';
import { GameManager } from '../../game-manager';

@Component({
  selector: 'app-host-game',
  template: ''
})
export class HostGameComponent implements Game, OnInit
{
    constructor(
		private hostStateHandler: HostStateHandler)
	{
		
	}

	ngOnInit() 
    {		
		/*const clientGrid: GridClient = new GridClient(this.clientStateHandler);
		GameManager.instance.init(clientGrid, () => {});*/		
    }

	stateHandler(): StateHandlerService
	{
		return this.hostStateHandler;
	}

    touchStart(event: TouchEvent): void
    {
        const touch: Touch = event.changedTouches[0];
        const x = touch.clientX;
        const y = touch.clientY;
    }

    mouseDown(event: MouseEvent): void
    {
        const x: number = event.clientX;
        const y: number = event.clientY;
    }

    touchEnd(event: TouchEvent): void
    {
        const touch: Touch = event.changedTouches[0];
        const x = touch.clientX;
        const y = touch.clientY;
    }

    mouseUp(event: MouseEvent): void
    {
        const x: number = event.clientX;
        const y: number = event.clientY;
    }
}

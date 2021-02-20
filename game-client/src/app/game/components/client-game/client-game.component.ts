import { Component, AfterViewInit, OnInit } from '@angular/core';
import { Vector } from 'vector2d';
import { Game } from '../game.component';

import { GameManager } from '../../game-manager';
import { ClientStateHandler } from '../../states/client-states/client-state-handler';
import { StateHandlerService } from '../../states/state-handler.service';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ClientCardManager } from '../../cards/client-card-manager';
import { GridClient } from '../../grid/client-grid';
import { ClientTurnSystem } from '../../turns/client-turn-system';

@Component({
  selector: 'app-client-game',
  template: ''
})
export class ClientGameComponent implements Game, OnInit, AfterViewInit
{    
    private interactionStart: Vector;

    constructor(
		private clientStateHandler: ClientStateHandler)	
		{		
			const clientGrid: GridClient = new GridClient(this.clientStateHandler);
			const clientTurnSystem: ClientTurnSystem = new ClientTurnSystem();
			const clientCardManager: ClientCardManager = new ClientCardManager(this.clientStateHandler);
			GameManager.instance.init(clientGrid, clientTurnSystem, clientCardManager, () => {});
		}

	ngOnInit() 
    {
		/*const clientGrid: GridClient = new GridClient(this.clientStateHandler);
		GameManager.instance.init(clientGrid, () => {});*/	
    }

	stateHandler(): StateHandlerService
	{
		return this.clientStateHandler;
	}

	ngAfterViewInit()
	{
		this.attachEventListeners();	
	}

    private attachEventListeners(): void
    {
        window.addEventListener('touchstart', this.touchStart.bind(this));
        window.addEventListener('touchend', this.touchEnd.bind(this));
        
        window.addEventListener('mousedown', this.mouseDown.bind(this));
        window.addEventListener('mouseup', this.mouseUp.bind(this));
    }

    private onDown(x: number, y: number): void
    {
        this.interactionStart = new Vector(x, y);
    }

    private onUp(x: number, y: number): void
    {
        const interaction: Vector = new Vector(x, y);
        const dist: number = this.interactionStart.distance(interaction);
        
        if (dist < 2)
        {
            //get the hex and do something with it.
            const hex = GameManager.instance.grid.getHexAt(interaction);
			GameManager.instance.hexClicked(hex);
        }
    }

    touchStart(event: TouchEvent): void
    {
        const touch: Touch = event.changedTouches[0];
        const x = touch.clientX;
        const y = touch.clientY;
        this.onDown(x, y);
    }

    mouseDown(event: MouseEvent): void
    {
        const x: number = event.clientX;
        const y: number = event.clientY; 
        this.onDown(x, y);
    }

    touchEnd(event: TouchEvent): void
    {
        const touch: Touch = event.changedTouches[0];
        const x = touch.clientX;
        const y = touch.clientY;
        this.onUp(x, y);
    }

    mouseUp(event: MouseEvent): void
    {
        const x: number = event.clientX;
        const y: number = event.clientY;
        this.onUp(x, y);
    }
}
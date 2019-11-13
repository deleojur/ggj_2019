import { state_conveyPlayerStartingPositions } from './client-interaction/turn-state-handling/state_convey-player-starting-positions';
import { StateHandler } from './../../../../game-shared/src/states/state-handling';
import { GameManager } from './../../../../game-shared/src/game-manager';

import { HostConnectionService } from 'src/services/connection.service';
import { Component, AfterViewInit, ViewChild, HostListener, ElementRef } from '@angular/core';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements AfterViewInit
{
    @ViewChild('pixiContainer', {static: false}) pixiContainer: ElementRef; // this allows us to reference and load stuff into the div container.
    private gameManager: GameManager;
    private stateHandler: StateHandler;
    constructor(private connection: HostConnectionService) 
    {
    }
    
    ngAfterViewInit()
    {
        this.gameManager = new GameManager(this.pixiContainer);
        this.gameManager.init(() =>
        {
            this.stateHandler = new StateHandler();
            this.stateHandler.init(this.gameManager, this.connection);
            this.stateHandler.transitionToState(new state_conveyPlayerStartingPositions());
        });        
    }

    @HostListener('window:resize', ['$event'])
    onResize(event)
    {
        this.gameManager.onResize(event);
    } 

    @HostListener('window:touchstart', ['$event'])
    touchStart(event: TouchEvent)
    {
        this.gameManager.touchStart(event);
    }

    @HostListener('window:mousedown', ['$event'])
    mouseDown(event: MouseEvent)
    {
        this.gameManager.mouseDown(event);
    }

    @HostListener('window:touchend', ['$event'])
    touchEnd(event: TouchEvent)
    {
        this.gameManager.touchEnd(event);
    }

    @HostListener('window:mouseup', ['$event'])
    mouseEnd(event: MouseEvent)
    {
        this.gameManager.mouseEnd(event);
    }
}

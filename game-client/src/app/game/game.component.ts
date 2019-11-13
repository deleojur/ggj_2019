import { state_waitForStartLocation } from './host-interaction/state_wait-for-start-location';
import { State_WaitForIncomingTurnData } from './../../../../game-host/src/app/game/client-interaction/turn-state-handling/state_wait-for-incoming-turn-data';
import { GameManager } from './../../../../game-shared/src/game-manager';
import { Component, AfterViewInit, ViewChild, HostListener } from '@angular/core';
import { StateHandler } from '../../../../game-shared/src/states/state-handling';
import { ClientConnectionService } from 'src/services/connection.service';
import { state_waitForUserInput } from './host-interaction/state_wait-for-user-input.ts';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements AfterViewInit
{
    @ViewChild('pixiContainer', {static: false}) pixiContainer; // this allows us to reference and load stuff into the div container
    private gameManager: GameManager;
    private stateHandler: StateHandler;

    constructor(private connection: ClientConnectionService)
    {
    }

    ngAfterViewInit()
    {
        this.gameManager = new GameManager(this.pixiContainer);
        this.stateHandler = new StateHandler();
        this.stateHandler.init(this.gameManager, this.connection);
        this.gameManager.init(() =>
        {
            this.waitForUserInput();
        });
    }

    private waitForUserInput(): void
    {
        const state: state_waitForStartLocation = new state_waitForStartLocation();
        this.stateHandler.transitionToState(state);
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

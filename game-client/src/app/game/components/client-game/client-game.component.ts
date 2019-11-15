import { ClientUtilsService } from './../../../../services/utils/client-utils.service';
import { GridManager } from './../../grid/grid';
import { Component } from '@angular/core';
import { GameService } from 'src/services/game.service';
import { Vector } from 'vector2d';
import { Game } from '../game.component';
import { StateHandlerService } from 'src/services/state-handler.service';

import { state_playerStartingPositions } from '../../states/turn-state-handling/state_player-starting-positions';
import { PositionData } from '../../states/request-data';
import { Hex } from 'honeycomb-grid';
import { Cell } from '../../grid/grid';
import { ViewportManager } from '../../grid/viewport';

@Component({
  selector: 'app-client-game',
  template: '',
  styles: []
})
export class ClientGameComponent implements Game
{
    private grid: GridManager;
    private viewport: ViewportManager;
    private interactionStart: Vector;
    private color: number;

    constructor(
        private stateHandlerService: StateHandlerService,
        private clientUtilsService: ClientUtilsService,
        private gameService: GameService) 
        {
            
        }

    onMapLoaded(): void
    {
        this.grid = this.gameService.grid;
        this.viewport = this.gameService.viewport;
        this.attachEventListeners();
        this.stateHandlerService.activateState<PositionData>(state_playerStartingPositions, (positionData) =>
        {
            const hex: Hex<Cell> = this.grid.getHex(positionData.x, positionData.y);
            const color: number = this.clientUtilsService.colorRGB;
            this.grid.renderHex(hex, color);
        });
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
        const interactionEnd: Vector = new Vector(x, y);
        const dist: number = this.interactionStart.distance(interactionEnd);
        
        if (dist < 2)
        {
            //get the hex and do something with it.
            
        }
    }

    private touchStart(event: TouchEvent): void
    {
        const touch: Touch = event.changedTouches[0];
        const x = touch.clientX;
        const y = touch.clientY;
        this.onDown(x, y);
    }

    private mouseDown(event: MouseEvent): void
    {
        const x: number = event.clientX;
        const y: number = event.clientY; 
        this.onDown(x, y);
    }

    private touchEnd(event: TouchEvent): void
    {
        const touch: Touch = event.changedTouches[0];
        const x = touch.clientX;
        const y = touch.clientY;
        this.onUp(x, y);
    }

    private mouseUp(event: MouseEvent): void
    {
        const x: number = event.clientX;
        const y: number = event.clientY;
        this.onUp(x, y);
    }
}
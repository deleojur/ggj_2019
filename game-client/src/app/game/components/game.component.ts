import { GameService } from '../../../services/game.service';
import { Component, AfterViewInit, ViewChild, ElementRef, HostListener, Output, EventEmitter } from '@angular/core';

export interface Game
{
    onMapLoaded(): void;

    touchStart(event: TouchEvent): void;
    touchEnd(event: TouchEvent): void;

    mouseDown(event: MouseEvent): void;
    mouseUp(event: MouseEvent): void;
}

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements AfterViewInit
{
    game: Game;

    @ViewChild('pixiContainer', {static: false}) pixiContainer: ElementRef;
    @ViewChild('uiContainer', {static: false}) uiContainer: ElementRef;

    constructor(private gameService: GameService) 
    {
    }
    
    ngAfterViewInit()
    {
        const canvas: HTMLCanvasElement = this.gameService.init(() =>
        {
            //the game has been initialized!
            this.game.onMapLoaded();
            
            return this.pixiContainer.nativeElement.appendChild(canvas);
        });
    }

    @HostListener('window:resize', ['$event'])
    onResize(event)
    {
        this.gameService.resizePixi();
    }

    onActivate(gameComponentReference: Game) 
    {
        this.game = gameComponentReference;
    }
}
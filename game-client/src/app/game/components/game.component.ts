import { GameService } from '../../../services/game.service';
import { Component, AfterViewInit, ViewChild, ElementRef, HostListener, Output, EventEmitter } from '@angular/core';

export interface Game
{
    onMapLoaded(): void;
}

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html'
})
export class GameComponent implements AfterViewInit
{
    private game: Game;

    @ViewChild('pixiContainer', {static: false}) pixiContainer: ElementRef; // this allows us to reference and load stuff into the div container.
    @Output() onMapLoaded: EventEmitter<null> = new EventEmitter();

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
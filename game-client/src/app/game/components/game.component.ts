import { GameService } from '../../../services/game.service';
import { Component, AfterViewInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { WindowComponent } from 'src/app/ui/window/window.component';
import { WindowService, WindowType } from 'src/services/window.service';
import { merchandiseService as MerchandiseService } from 'src/services/merchandise.service';

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
    @ViewChild(WindowComponent, {static: true}) windowContainer: WindowComponent;

    constructor(private gameService: GameService, private windowService: WindowService, private merch: MerchandiseService) 
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

		this.windowService.windowComponent = this.windowContainer;
		this.windowService.openWindow(WindowType.ItemOverview, { name: 'Build', data : this.merch.getMerchandise('town') });
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
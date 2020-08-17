import { Component, AfterViewInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { WindowComponent } from 'src/app/ui/window/window.component';
import { GameManager } from '../game-manager';
import { StateHandlerService } from '../states/state-handler.service';
import { GridClient } from '../grid/client-grid';
import { ClientTurnSystem } from '../turns/client-turn-system';
import { ClientStateHandler } from '../states/client-states/client-state-handler';

export interface Game
{
	stateHandler(): StateHandlerService;

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
	stateHandler: StateHandlerService;

    @ViewChild('pixiContainer', {static: false}) pixiContainer: ElementRef;
    @ViewChild(WindowComponent, {static: true}) windowContainer: WindowComponent;

    constructor(private clientStateHandler: ClientStateHandler)
    {
		
    }
    
    ngAfterViewInit()
    {
		const clientGrid: GridClient = new GridClient(this.clientStateHandler);
		const clientTurnSystem: ClientTurnSystem = new ClientTurnSystem();
		GameManager.instance.init(clientGrid, clientTurnSystem, () => 
		{
			GameManager.instance.generateDebugClients();
			const canvas: HTMLCanvasElement = GameManager.instance.worldCanvas;
			this.pixiContainer.nativeElement.appendChild(canvas);
			GameManager.instance.windowManager.windowComponent = this.windowContainer;
			GameManager.instance.startGame();
		});
    }

    @HostListener('window:resize', ['$event'])
    onResize(event)
    {
        GameManager.instance.resizePixi();
    }

    onActivate(gameComponentReference: Game) 
    {
		this.game = gameComponentReference;
		this.stateHandler = this.game.stateHandler();
    }
}
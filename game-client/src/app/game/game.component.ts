import { GameManager } from './../../../../game-shared/src/game-manager';
import { Subject } from 'rxjs';
import { Component, AfterViewInit, ViewChild, HostListener } from '@angular/core';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements AfterViewInit
{
    @ViewChild('pixiContainer', {static: false}) pixiContainer; // this allows us to reference and load stuff into the div container
    private gameManager: GameManager;

    ngAfterViewInit()
    {
        this.gameManager = new GameManager(this.pixiContainer);
        this.gameManager.init();
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

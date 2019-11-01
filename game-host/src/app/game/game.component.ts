import { ClientData } from './../../services/connection.service';
import { ConnectionService } from 'src/services/connection.service';
import { Subject } from 'rxjs';
import { GridManager, iGrid } from './game-ts/grid/grid';
import { ViewportManager, iViewport } from './game-ts/viewport';
import { Component, OnInit, AfterViewInit, ViewChild, HostListener } from '@angular/core';
import * as PIXI from 'pixi.js';
import { Vector } from 'vector2d/src/Vec2D';

export interface iGame
{
    readonly $onClick: Subject<Vector>;
    readonly $update: Subject<number>;
    readonly $render: Subject<null>;
    readonly $graphics: PIXI.Graphics;
    readonly $pixi: PIXI.Application;
    readonly $viewport: iViewport;
    readonly $grid: iGrid;
}

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit, AfterViewInit, iGame
{
    @ViewChild('pixiContainer', {static: false}) pixiContainer; // this allows us to reference and load stuff into the div container

    private pixi: PIXI.Application; // this will be our pixi application
    public get $pixi(): PIXI.Application
    {
        return this.pixi;
    }

    private graphics: PIXI.Graphics;
    public get $graphics(): PIXI.Graphics
    {
        return this.graphics;
    }    

    private viewport: ViewportManager;
    public get $viewport(): iViewport
    {
        return this.viewport;
    }

    private grid: GridManager;
    public get $grid(): iGrid
    {
        return this.grid;
    }

    private interactionStart: Vector;

    private onClick: Subject<Vector> = new Subject<Vector>();
    public get $onClick(): Subject<Vector>
    {
        return this.onClick;
    }

    private update: Subject<number> = new Subject<number>();
    public get $update(): Subject<number>
    {
        return this.update;
    }

    private render: Subject<null> = new Subject<null>();
    public get $render(): Subject<null>
    {
        return this.render;
    }

    private ratio: number;

    constructor(private connection: ConnectionService) 
    {
        
    }
    
    private initPixi(): void
    {
        this.pixi = new PIXI.Application({ backgroundColor: 0xffd900 });
        this.graphics = new PIXI.Graphics();
        PIXI.autoDetectRenderer({width: window.innerWidth, height: window.innerHeight, antialias: true, transparent: true });
        this.ratio = window.innerWidth / window.innerHeight;    
    }   

    initTicker()
    {
        const ticker = PIXI.Ticker.shared;
        // Set this to prevent starting this ticker when listeners are added.
        // By default this is true only for the PIXI.Ticker.shared instance.
        ticker.autoStart = false;
        // FYI, call this to ensure the ticker is stopped. It should be stopped
        // if you have not attempted to render anything yet.
        ticker.stop();
        // Call this when you are ready for a running shared ticker.
        ticker.start();

        ticker.add((time) =>
        {
            this.update.next(time);
            this.render.next();
        });
    }

    generateDebuggerClients(): ClientData[]
    {
        const debugClients: ClientData[] =[];
        const client1 = {roomid: '', id: '', addr: '', color: '0x0000ff', name: 'Jur'};
        const client2 = {roomid: '', id: '', addr: '', color: '0x00ffff', name: 'Laura'};
        const client3 = {roomid: '', id: '', addr: '', color: '0xff00ff', name: 'Alex'};
        const client4 = {roomid: '', id: '', addr: '', color: '0xffff00', name: 'Sam'};
        const client5 = {roomid: '', id: '', addr: '', color: '0xffff00', name: 'asdsad'};
        const client6 = {roomid: '', id: '', addr: '', color: '0xffff00', name: 'Saad'};
        debugClients.push(client1, client2, client3, /*client4, /*client5, client6 */);
        return debugClients;
    }

    ngOnInit() 
    {
        this.initPixi();
        this.grid = new GridManager(this);
        const size: Vector = this.grid.generateWorld(this.generateDebuggerClients());
        this.viewport = new ViewportManager(this, size);
        this.viewport.$viewport.addChild(this.graphics);
        this.initTicker();        
    }

    ngAfterViewInit()
    {
        this.pixiContainer.nativeElement.appendChild(this.pixi.view);
        this.resizePixi();
    }

    @HostListener('window:resize', ['$event'])
    onResize(event)
    {
        this.resizePixi();
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
            this.onClick.next(interactionEnd);
        }
    }

    @HostListener('window:touchstart', ['$event'])
    touchStart(event: TouchEvent)
    {
        const touch: Touch = event.changedTouches[0];
        const x = touch.clientX;
        const y = touch.clientY;
        this.onDown(x, y);
    }

    @HostListener('window:mousedown', ['$event'])
    mouseDown(event: MouseEvent)
    {
        const x: number = event.clientX;
        const y: number = event.clientY; 
        this.onDown(x, y);
    }

    @HostListener('window:touchend', ['$event'])
    touchEnd(event: TouchEvent)
    {
        const touch: Touch = event.changedTouches[0];
        const x = touch.clientX;
        const y = touch.clientY;
        this.onUp(x, y);
    }

    @HostListener('window:mouseup', ['$event'])
    mouseEnd(event: MouseEvent)
    {
        const x: number = event.clientX;
        const y: number = event.clientY;
        this.onUp(x, y);
    }

    resizePixi()
    {
        let w: number = window.innerWidth;
        let h: number = window.innerHeight;
        if (w / h >= this.ratio) 
        {
            w = h * this.ratio;
        } else 
        {            
            h = w / this.ratio;
        }
        this.pixi.renderer.resize(w, h);
        this.pixi.stage.scale.set(1, 1);
    }
}

import { ViewportManager } from './viewport';
import { GridManager } from './grid/grid';
import { Subject } from 'rxjs';
import * as PIXI from 'pixi.js';
import { Vector } from 'vector2d/src/Vec2D';

export interface iGame
{
    readonly $onClick: Subject<Vector>;
    readonly $update: Subject<number>;
    readonly $render: Subject<null>;
    readonly $graphics: PIXI.Graphics;
    readonly $pixi: PIXI.Application;
    readonly $viewport: ViewportManager;
    readonly $grid: GridManager;
}

export class GameManager implements iGame
{
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
    public get $viewport(): ViewportManager
    {
        return this.viewport;
    }

    private grid: GridManager;
    public get $grid(): GridManager
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

    constructor(private pixiContainer: any) 
    {
        
    }
    
    private initPixi(): void
    {
        this.pixi = new PIXI.Application({ backgroundColor: 0x0 });
        this.graphics = new PIXI.Graphics();
        PIXI.autoDetectRenderer({ width: window.innerWidth, height: window.innerHeight, antialias: true, transparent: true });
        this.ratio = window.innerWidth / window.innerHeight;    
    } 
    
    private initGrid(): void
    {
        this.grid = new GridManager(this.viewport, this.graphics);
        //this.generateDebuggerClients();
        this.grid.generateWorld((width: number, height: number) => 
        {
            this.viewport.initViewport(width, height);
            this.grid.initSprites();
            this.viewport.$viewport.addChild(this.graphics);
        });
    }

    public init(): void
    {
        this.initPixi();
        this.viewport = new ViewportManager(this.pixi);
        this.initGrid();
        this.pixiContainer.nativeElement.appendChild(this.pixi.view);
        this.resizePixi();
    }

    generateDebuggerClients(): ClientData[]
    {
        const debugClients: ClientData[] =[];
        /* const client1 = {roomid: '', id: '', addr: '', color: '0x0000ff', name: 'Jur'};
        const client2 = {roomid: '', id: '', addr: '', color: '0x00ffff', name: 'Laura'};
        const client3 = {roomid: '', id: '', addr: '', color: '0xff00ff', name: 'Alex'};
        const client4 = {roomid: '', id: '', addr: '', color: '0xffff00', name: 'Sam'};
        const client5 = {roomid: '', id: '', addr: '', color: '0xffff00', name: 'asdsad'};
        const client6 = {roomid: '', id: '', addr: '', color: '0xffff00', name: 'Saad'};
        debugClients.push(client1, client2, client3, /*client4, client5, client6);*/
        return debugClients;
    }

    public onResize(event)
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
            this.grid.onClick(interactionEnd);
        }
    }

    public touchStart(event: TouchEvent): void
    {
        const touch: Touch = event.changedTouches[0];
        const x = touch.clientX;
        const y = touch.clientY;
        this.onDown(x, y);
    }

    public mouseDown(event: MouseEvent): void
    {
        const x: number = event.clientX;
        const y: number = event.clientY; 
        this.onDown(x, y);
    }

    public touchEnd(event: TouchEvent): void
    {
        const touch: Touch = event.changedTouches[0];
        const x = touch.clientX;
        const y = touch.clientY;
        this.onUp(x, y);
    }

    public mouseEnd(event: MouseEvent): void
    {
        const x: number = event.clientX;
        const y: number = event.clientY;
        this.onUp(x, y);
    }

    private resizePixi(): void
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

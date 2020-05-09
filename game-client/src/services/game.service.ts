import { Cell } from './../app/game/grid/grid';
import { Injectable } from '@angular/core';
import { ViewportManager } from '../app/game/render/viewport';
import { GridManager } from '../app/game/grid/grid';
import * as PIXI from 'pixi.js';
import { Subject } from 'rxjs';
import { Hex } from 'honeycomb-grid';

@Injectable({
    providedIn: 'root'
})
export class GameService
{
    private pixi: PIXI.Application; // this will be our pixi application
    private graphics: PIXI.Graphics;
    private _viewport: ViewportManager;
    private _grid: GridManager;
    private ratio: number;
    private _onCellSelected: Subject<Hex<Cell>> = new Subject<Hex<Cell>>();

    public get onCellSelected(): Subject<Hex<Cell>>
    {
        return this._onCellSelected;
    }

    public get grid(): GridManager
    {
        return this._grid;
    }

    public get viewport(): ViewportManager
    {
        return this._viewport;
    }

    private initPixi(): void
    {
        this.pixi = new PIXI.Application({ backgroundColor: 0x0 });
        this.graphics = new PIXI.Graphics();
        
        PIXI.autoDetectRenderer({ 
            width: window.innerWidth,
            height: window.innerHeight, 
            antialias: true, 
            transparent: true });

        this.ratio = window.innerWidth / window.innerHeight;
    } 
    
    private initGrid(cb: () => void): void
    {
        this._grid = new GridManager(this.viewport, this.graphics);
        this._grid.generateWorld().then((size) =>
        {
			console.log(size);
            this.viewport.initViewport(size.x, size.y);
            this._grid.loadTextures();
            this.viewport.$viewport.addChild(this.graphics);
            return cb();
        });
    }

    public init(cb: () => void): HTMLCanvasElement
    {
        this.initPixi();
        this._viewport = new ViewportManager(this.pixi);
        this.initGrid(cb);
        this.resizePixi();
        return this.pixi.view;
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

    public resizePixi(): void
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
	
	public addIcon(origin: Hex<Cell>, src: string): void
	{
		
	}

	public removeIcon(origin: Hex<Cell>): void
	{

	}

	public createEntity(origin: Hex<Cell>, playerId: string, entityName: string): void
	{
		this.grid.createEntity(origin, playerId, entityName);
	}

	public removeEntity(origin: Hex<Cell>): void
	{

	}

	public moveEntity(): void
	{

	}

    public selectHex(hex: Hex<Cell>): void
    {
        this._onCellSelected.next(hex);
    }
}

import * as PIXI from 'pixi.js';
import { Subject } from 'rxjs';
import { Hex } from 'honeycomb-grid';
import { EntityInformation, Entity } from 'src/app/game/entities/entity';
import { TurnsSystem } from 'src/app/game/turns/turns-system';
import { AssetLoader } from 'src/app/asset-loader';
import { ViewportManager } from './render/viewport';
import { GridManager, Cell } from './grid/grid';
import { TurnCommand, TurnInformation } from './turns/turn-command';

export class GameManager
{
    private pixi: PIXI.Application; // this will be our pixi application
    private graphics: PIXI.Graphics;
    private _viewport: ViewportManager;
	private _grid: GridManager;
	private _turnSystem: TurnsSystem;
	private ratio: number;

	private static _instance: GameManager = null;
	public static get instance(): GameManager
	{
		if (this._instance === null)
		{
			this._instance = new GameManager();
		}
		return this._instance;
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
		AssetLoader.instance.loadAssetsAsync().then(() => 
		{			
			const size: PIXI.Point = this._grid.generateWorld();
			this.viewport.initViewport(size.x, size.y);
			this._grid.initLayers();
			this._turnSystem = new TurnsSystem(this._viewport);
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
	
	public getCells(origin: Hex<Cell>): Hex<Cell>[]
	{
		//TODO: temporary; get a list of hexes that is valid for an action.
		return this.grid.getNeighbors(origin);
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

	public addTurnCommand(turnCommand: TurnInformation): void
	{
		//create a temporary turn command.
		//when the player cancels, the state will return to what it was before.
		this._turnSystem.addTurnCommand(turnCommand);
	}

	public removeTurnCommand(turnCommand: TurnCommand): void
	{
		
	}

	public createEntity(origin: Hex<Cell>, playerId: string, entityName: string): Entity
	{
		return this.grid.createEntity(origin, playerId, entityName);
	}

	public removeEntity(origin: Hex<Cell>): void
	{

	}
}

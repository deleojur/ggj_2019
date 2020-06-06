import * as PIXI from 'pixi.js';
import { Subject } from 'rxjs';
import { Hex } from 'honeycomb-grid';
import { EntityInformation, Entity, BehaviorInformation } from 'src/app/game/entities/entity';
import { TurnsSystem } from 'src/app/game/turns/turns-system';
import { AssetLoader } from 'src/app/asset-loader';
import { ViewportManager } from './render/viewport';
import { GridManager, Cell } from './grid/grid';
import { TurnCommand, TurnInformation } from './turns/turn-command';
import { WindowManager, WindowType, WindowItem } from '../ui/window/window-manager';
import { ResourceManager } from 'src/app/game/components/resourceManager';
import { ItemOverviewWindowComponent } from '../ui/window/item-overview-window/item-overview-window.component';
import { ItemDetailWindowComponent } from '../ui/window/item-detail-window/item-detail-window.component';
import { SelectCellComponent } from '../ui/window/select-cell/select-cell.component';

export class GameManager
{
    private pixi: PIXI.Application; // this will be our pixi application
    private graphics: PIXI.Graphics;
    private _viewport: ViewportManager;
	private _grid: GridManager;
	private _turnSystem: TurnsSystem;
	private ratio: number;

	private _resourceManager: ResourceManager;
	private _windowManager: WindowManager;

	private _validCells: Hex<Cell>[] = null;
	private _originCell: Hex<Cell>;
	private _currentItem: BehaviorInformation = null;

	private static _instance: GameManager = null;
	public static get instance(): GameManager
	{
		if (this._instance === null)
		{
			this._instance = new GameManager();
		}
		return this._instance;
	}

	private constructor()
	{
		this._resourceManager = new ResourceManager();
		this.initWindowManager();
	}

	public get resourceManager(): ResourceManager
	{
		return this._resourceManager;
	}

	public get windowManager(): WindowManager
	{
		return this._windowManager;
	}

    public get grid(): GridManager
    {
        return this._grid;
    }

    public get viewport(): ViewportManager
    {
        return this._viewport;
	}
	
	public get turnSystem(): TurnsSystem
	{
		return this._turnSystem;
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
		this._turnSystem = new TurnsSystem(this.viewport);
		AssetLoader.instance.loadAssetsAsync().then(() => 
		{			
			const size: PIXI.Point = this._grid.generateWorld();
			this.viewport.initViewport(size.x, size.y);
			this._grid.initLayers();
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

	private initWindowManager(): void
	{
		this._windowManager = new WindowManager();
		this.windowManager.subscribeWindow(WindowType.ItemOverview, new WindowItem(ItemOverviewWindowComponent));
		this.windowManager.subscribeWindow(WindowType.ItemDetail, new WindowItem(ItemDetailWindowComponent));
		this.windowManager.subscribeWindow(WindowType.SelectCell, new WindowItem(SelectCellComponent));
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
	
	public hexClicked(hex: Hex<Cell>): void
	{
		if (this._validCells !== null)
		{
			const isHexValid: boolean = this._validCells.indexOf(hex) > -1;
			if (isHexValid)
			{
				this._windowManager.closeAllWindows(() =>
				{
					this._resourceManager.subtractResources(this._currentItem.cost);
					const entity: Entity = this._grid.createEntity(hex, 'someone', this._currentItem.creates);
					const turnInformation: TurnInformation = 
					{
						behaviorInformation: this._currentItem,
						originCell: this._originCell,
						targetCell: hex, //get the target cell, if applicable.
						originEntity: null, //the entity before the command started.
						targetEntity: entity, //create a new entity if there is one in the item.
						iconTextureUrl: this._currentItem.commandIconTextureUrl
					};
					this._turnSystem.addTurnCommand(turnInformation);									
				});
			}
		} else if (hex.entity && !this.windowManager.isWindowOpen)
		{
			this.windowManager.openWindow(WindowType.ItemOverview, { name: 'Select Action', data: { origin: hex, entity: hex.entity } });
			GameManager.instance.grid.renderHexCorners([hex]);
		}
	}

	public renderValidCells(origin: Hex<Cell>): void
	{
		this._validCells = this.grid.getListOfValidNeighbors(origin);
		this.grid.renderValidCells(origin, this._validCells);
	}

	public clearValidCells(): void
	{
		this._validCells = null;
		this.grid.clearValidCells();
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

	public removeTurnCommand(turnCommand: TurnCommand): void
	{
		
	}

	public removeEntity(origin: Hex<Cell>): void
	{

	}

	public purchaseItem(item: BehaviorInformation, origin: Hex<Cell>): void
	{
		if (item.range > 0)
		{
			this._windowManager.openWindow(WindowType.SelectCell, { name: '¿Que?', data: 
			{
				//get a list of possible tiles.
				origin: origin
			}});
			this._originCell = origin;
			this._currentItem = item;
		} else
		{
			this._windowManager.closeAllWindows(() =>
			{
				this._resourceManager.subtractResources(item.cost);
			});
		}
	}
}
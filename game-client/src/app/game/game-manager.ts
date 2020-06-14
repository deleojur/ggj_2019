import { Hex } from 'honeycomb-grid';
import { Entity, BehaviorInformation } from 'src/app/game/entities/entity';
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
import { Sprite, Point, Texture, Application, Graphics, autoDetectRenderer } from 'pixi.js';

export class GameManager
{
    private pixi: Application; // this will be our pixi application
	private _gridGraphics: Graphics;
	private _commandGraphics: Graphics;
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
        this.pixi = new Application({ backgroundColor: 0x0 });
		this._gridGraphics = new Graphics();
		this._commandGraphics = new Graphics();
        
        autoDetectRenderer({ 
            width: window.innerWidth,
            height: window.innerHeight, 
            antialias: true, 
            transparent: true });

        this.ratio = window.innerWidth / window.innerHeight;
    } 
    
    private initGrid(cb: () => void): void
    {
		this._grid = new GridManager(this.viewport, this._gridGraphics);
		AssetLoader.instance.loadAssetsAsync().then(() => 
		{			
			const size: Point = this._grid.generateWorld();
			this.viewport.initViewport(size.x, size.y);
			this._grid.initLayers();
			this.viewport.addChild(this._commandGraphics);
			this._turnSystem = new TurnsSystem(this._commandGraphics);
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

	private createEntity(hex: Hex<Cell>, item: BehaviorInformation)
	{
		this._resourceManager.subtractResources(item.cost);
		const entity: Entity = this._grid.createEntity(hex, 'someone', item.creates);
		const turnInformation: TurnInformation = 
		{
			behaviorInformation: item,
			originCell: this._originCell,
			targetCell: hex, //get the target cell, if applicable.
			originEntity: null, //TODO: get this from the grid. //the entity before the command started.
			targetEntity: entity, //create a new entity if there is one in the item.
			iconTextureUrl: item.commandIconTextureUrl
		};
		this._turnSystem.addTurnCommand(turnInformation);		
	}
	
	private selectValidCell(hex: Hex<Cell>): void
	{
		const isHexValid: boolean = this._validCells.indexOf(hex) > -1;
		if (isHexValid)
		{
			this._windowManager.closeAllWindows(() =>
			{
				this.createEntity(hex, this._currentItem);				
			});
		}
	}

	public hexClicked(hex: Hex<Cell>): void
	{
		if (this._validCells !== null)
		{
			this.selectValidCell(hex);
		} else if (hex.entity && !this.windowManager.isWindowOpen)
		{
			this.windowManager.openWindow(WindowType.ItemOverview, { name: 'Select Action', data: { origin: hex, entity: hex.entity } });

			const turnInformationArray: TurnInformation[] = this._turnSystem.getTurnInformation(hex);
			if (turnInformationArray.length > 0)
			{
				turnInformationArray.forEach((turnInformation: TurnInformation) =>
				{
					const origin: Hex<Cell> = turnInformation.originCell;
					const target: Hex<Cell> = turnInformation.targetCell;
					GameManager.instance.grid.renderSelectedCellsOutline([origin, target]);
				});				
			}
			else
			{
				GameManager.instance.grid.renderSelectedCellsOutline([hex]);
			}			
		}
	}

	public renderValidCells(origin: Hex<Cell>): void
	{
		console.log(origin);
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
				this.createEntity(origin, item);
			});
		}
	}

	public unpurchaseItem(origin: Hex<Cell>, behaviorInformation: BehaviorInformation): void
	{
		const turnInformation: TurnInformation = this._turnSystem.removeTurnCommand(origin, behaviorInformation);
		this._resourceManager.addResource(turnInformation.behaviorInformation.cost);
		const entity: Entity = turnInformation.originEntity;
		if (entity === null)
		{
			this._grid.removeEntity(turnInformation.targetCell);
		}
		this._grid.clearSelectedCells();
		this._windowManager.closeAllWindows();
	}

	public createSprite(textureUrl: string, position: Point, scale: Point): Sprite
	{
		const texture: Texture = AssetLoader.instance.getTexture(textureUrl);
		const sprite: Sprite = new Sprite(texture);
		sprite.scale = scale;
		sprite.position = position;
		sprite.anchor = new Point(0.5, 0.5);
		return sprite;
	}
}	
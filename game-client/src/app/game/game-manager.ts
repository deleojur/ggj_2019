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
import { Subject, Subscription } from 'rxjs';
import { GridStrategy, RenderType } from './grid/grid-strategy';
import { ClientStateHandler } from './states/client-states/client-state-handler';
import { GridClient } from './grid/client-grid';
import { ClientInteraction } from './client-interaction';

export class GameManager
{
	private isInitialized: boolean = false;
	private _worldCanvas: HTMLCanvasElement = null;	

	private pixi: Application; // this will be our pixi application
    private _viewport: ViewportManager;
	private _grid: GridManager;
	private _gridStrategy: GridStrategy;
	private _turnSystem: TurnsSystem;
	private _clientInteraction: ClientInteraction;
	private ratio: number;

	private _resourceManager: ResourceManager;
	private _windowManager: WindowManager;

	private _onHexClicked: Subject<Hex<Cell>> = new Subject<Hex<Cell>>();

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
	
	public get gridStrategy(): GridStrategy
	{
		return this._gridStrategy;
	}

	public get clientInteraction(): ClientInteraction
	{
		return this._clientInteraction;
	}

	public get clientGrid(): GridClient
	{
		return this._gridStrategy as GridClient;
	}

	public get clientStateHandler(): ClientStateHandler
	{
		return this.clientGrid.clientStateHandler;
	}

    public get viewport(): ViewportManager
    {
        return this._viewport;
	}
	
	public get turnSystem(): TurnsSystem
	{
		return this._turnSystem;
	}

	public subscribeToClickEvent(f: (cell: Hex<Cell>) => void): Subscription
	{
		return this._onHexClicked.subscribe(f);
	}

    private initPixi(): void
    {
        this.pixi = new Application({ backgroundColor: 0x0 });
        
        autoDetectRenderer({ 
            width: window.innerWidth,
            height: window.innerHeight, 
            antialias: true, 
            transparent: true});

        this.ratio = window.innerWidth / window.innerHeight;
    } 
    
    private initGrid(cb: () => void): void
    {
		this._grid = new GridManager(this._gridStrategy, this.viewport);
		AssetLoader.instance.loadAssetsAsync().then(() => 
		{
			const gridGraphics: Graphics = new Graphics, commandGraphics: Graphics = new Graphics();
			const size: Point = this._grid.generateWorld();
			this.viewport.initViewport(size.x, size.y);
			this._grid.init(gridGraphics);
			this._turnSystem = new TurnsSystem(commandGraphics);

			this.viewport.addChild(gridGraphics);
			this.viewport.addChild(commandGraphics);
			return cb();
		});
	}
	
	private generateWorld(cb: () => void): HTMLCanvasElement
	{		
		this.initPixi();
		this._viewport = new ViewportManager(this.pixi);
        this.initGrid(cb);
		this.resizePixi();
		this._worldCanvas = this.pixi.view;
        return this._worldCanvas;
	}

	public get worldCanvas(): HTMLCanvasElement
	{
		if (this._worldCanvas === null)
		{
			return this.generateWorld(() => { });
		}
		return this._worldCanvas;
	}

    public init(gridStrategy: GridStrategy, cb: () => void): void
    {
		if (!this.isInitialized)
		{	
			this.isInitialized = true;
			this._gridStrategy = gridStrategy;
			this._clientInteraction = new ClientInteraction();
			this.generateWorld(cb);
		}
	}

	private initWindowManager(): void
	{
		this._windowManager = new WindowManager();
		this.windowManager.subscribeWindow(WindowType.ItemOverview, new WindowItem(ItemOverviewWindowComponent));
		this.windowManager.subscribeWindow(WindowType.ItemDetail, new WindowItem(ItemDetailWindowComponent));
		this.windowManager.subscribeWindow(WindowType.SelectCell, new WindowItem(SelectCellComponent));
	}

	public startGame(): void
	{
		this._gridStrategy.renderEntitiesByOwnerColor();
	}

	public renderCellsOutline(): void
	{
		this.gridStrategy.renderEntitiesByOwnerColor();

		const color: number = this.clientGrid.clientColor;
		const turnCommands: TurnCommand[] = this._turnSystem.getAllTurnCommands();
		const cells: Hex<Cell>[] = [];
		turnCommands.forEach(turnCommand =>
		{
			cells.push(turnCommand.turnInformation.targetCell);
		});
		this._gridStrategy.renderSelectedCellsOutline(cells, color, RenderType.DottedLine);
	}

	public createTurnCommand(
		originCell: Hex<Cell>,
		targetCell: Hex<Cell>,
		entity: Entity,
		item: BehaviorInformation): void
	{
		this._resourceManager.subtractResources(item.cost);
		const turnInformation: TurnInformation = this._turnSystem.generateTurnInformation(originCell, targetCell, entity, item);
		this._turnSystem.addTurnCommand(turnInformation);
	}

	public hexClicked(hex: Hex<Cell>): void
	{
		this._onHexClicked.next(hex);
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

	public acquireItem(item: BehaviorInformation, origin: Hex<Cell>, entity: Entity): void
	{
		if (item.range > 0)
		{
			this._windowManager.openWindow(WindowType.SelectCell, { name: '¿Que?', data: 
			{
				origin: origin,
				behavior: item,
				entity: entity
			}});
		} else
		{
			this._windowManager.closeAllWindows(() =>
			{
				this.createTurnCommand(origin, origin, entity, item);
			});
		}
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
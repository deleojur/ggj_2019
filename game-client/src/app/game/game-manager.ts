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
import { ClientData } from './states/request-data';
import { StateHandlerService } from './states/state-handler.service';
import { ClientStateHandler } from './states/client-states/client-state-handler';

export class GameManager
{
	private _stateHandler: StateHandlerService;
	private _worldCanvas: HTMLCanvasElement = null;
	private _onWorldLoaded: () => void;

	private pixi: Application; // this will be our pixi application
	private _gridGraphics: Graphics;
	private _commandGraphics: Graphics;
    private _viewport: ViewportManager;
	private _grid: GridManager;
	private _turnSystem: TurnsSystem;
	private ratio: number;

	private _resourceManager: ResourceManager;
	private _windowManager: WindowManager;

	private onHexClicked: Subject<Hex<Cell>> = new Subject<Hex<Cell>>();
	private hexSubscription: Subscription;

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
		this.grantControlOverHexSelection();
	}

	public grantControlOverHexSelection(): void
	{
		this.hexSubscription = this.subscribeToClickEvent((hex: Hex<Cell>) => 
		{
			this.onHexSelected(hex);
		});
	}

	public revokeControlOverHexSelection(): void
	{
		this.hexSubscription.unsubscribe();
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

	public subscribeToClickEvent(f: (cell: Hex<Cell>) => void): Subscription
	{
		return this.onHexClicked.subscribe(f);
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
		this._grid = new GridManager(this._stateHandler, this.viewport, this._gridGraphics);
		AssetLoader.instance.loadAssetsAsync().then(() => 
		{			
			const size: Point = this._grid.generateWorld();
			this.viewport.initViewport(size.x, size.y);
			this._grid.initialize();
			this.viewport.addChild(this._commandGraphics);
			this._turnSystem = new TurnsSystem(this._commandGraphics);
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

    public init(stateHandler: StateHandlerService, cb: () => void): void
    {
		this._stateHandler = stateHandler;
		this.generateWorld(cb);
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

	private onHexSelected(hex: Hex<Cell>): void
	{
		const clientId: string = (this._stateHandler as ClientStateHandler).getClientData().id;
		const entities: Entity[] = this._grid.getEntitiesAtHexOfOwner(hex, clientId).slice();
		const turnInformation: TurnInformation[] = this.turnSystem.getTurnInformation(hex);

		turnInformation.forEach(turnInfo =>
		{
			const entity: Entity = turnInfo.targetEntity;
			if (entities.indexOf(entity) === -1 && 
				entities.indexOf(turnInfo.originEntity) === -1)
			{
				entities.push(entity);
			}
		});

		if (entities.length > 0)
		{			
			this.hexSubscription.unsubscribe();
			this.windowManager.openWindow(WindowType.ItemOverview, { name: 'Select Action', data: { origin: hex, entities: entities } });

			const turnInformationArray: TurnInformation[] = this._turnSystem.getTurnInformation(hex);
			if (turnInformationArray.length > 0)
			{
				turnInformationArray.forEach((turnInformation: TurnInformation) =>
				{
					const origin: Hex<Cell> = turnInformation.originCell;
					const target: Hex<Cell> = turnInformation.targetCell;
					GameManager.instance.grid.renderSelectedCellsOutline([origin, target], this._stateHandler.getColor(clientId));
				});				
			}
			else
			{
				GameManager.instance.grid.renderSelectedCellsOutline([hex], this._stateHandler.getColor(clientId));
			}			
		}
	}

	public hexClicked(hex: Hex<Cell>): void
	{
		this.onHexClicked.next(hex);
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

	public cancelAcquireItem(item: BehaviorInformation, origin: Hex<Cell>, entity: Entity): void
	{
		const turnInformation: TurnInformation = this._turnSystem.removeTurnCommand(origin, item);
		this._resourceManager.addResource(turnInformation.behaviorInformation.cost);
		if (entity === null)
		{
			this._grid.removeEntity(turnInformation.targetCell, turnInformation.targetEntity);
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
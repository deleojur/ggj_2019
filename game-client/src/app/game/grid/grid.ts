import { MapReader, TileProperty, Object, WorldMap, Entity, HexID } from './map-reader';
import { Vector } from 'vector2d/src/Vec2D';
import { defineGrid, GridFactory, Hex, Point, Grid, PointLike } from 'honeycomb-grid';
import { Graphics, Sprite, Point as pPoint, Polygon, Container } from 'pixi.js';
import { ViewportManager } from '../render/viewport';
import { AssetLoader } from 'src/app/asset-loader';
import { GridStrategy, RenderType } from './grid-strategy';
import { TileEntity } from '../entities/tile-entities/tile-entity';
import { zIndex } from 'html2canvas/dist/types/css/property-descriptors/z-index';

export interface Cell
{
	parent?: Hex<Cell>; //used in searching paths.
    color?: string; 
	isGenerated?: boolean;
    properties: TileProperty[];
	sprites: { sprite: PIXI.Sprite, zIndex: number } [];
	walkable: boolean; //units can walk on this tile.
	buildable: boolean; //structures can be built on this tile.
	road: number[]; //units have a speed advantage on this tile.
}

export class GridManager
{	
    private gridFactory: GridFactory<Hex<Cell>>;
    private grid: Grid<Hex<Cell>>;
	private _tilesContainer: Container;

	private _provinces: Map<number, Hex<Cell>[]>;
	private _playerStartPositions: Hex<Cell>[];
    private tileWidth: number = 147.75;
    private tileHeight: number = 129.5;
	private mapReader: MapReader;

    constructor(private gridStrategy: GridStrategy, private viewport: ViewportManager)
    {		
		this.mapReader = new MapReader();
		this._provinces = new Map<number, Hex<Cell>[]>();
		this._tilesContainer = new Container();
		this._tilesContainer.sortableChildren = true;		
		this._playerStartPositions = [];
	}

    private initHexagonalGrid(): pPoint
    {
		this.gridFactory = defineGrid();
		const worldMap: WorldMap = AssetLoader.instance.worldMap;
		this.grid = this.gridFactory.rectangle({ width: worldMap.width, height: worldMap.height });

		this.grid.forEach(hex =>
		{
			hex.sprites = [];
			hex.properties = [];
		});

		const r = this.tileWidth;
		const w = 1.732 * this.tileHeight;
		const h = r * 2;
		//TODO: Make sure the size is correct.
		return new pPoint(w * (worldMap.width * 2), h * (worldMap.height + 1));
    }

    public generateWorld(): pPoint
    {
		const size: pPoint = this.initHexagonalGrid();
		this.mapReader.parseWorldMap(this.grid);
		return size;
    }

    public init(gridGraphics: Graphics, pathGraphics: Graphics): void
    {
		this.initObjectLayer(this.mapReader.hexUnderLayer);
		this.initTileLayer();
		this.gridStrategy.init(gridGraphics, pathGraphics);
		this.initLocationLayer(this.mapReader.hexIdLayer);
		this.initEntityLayer(this.mapReader.entities);
		this.initObjectLayer(this.mapReader.hexOverLayer);
	}
	
    private initTileLayer(): void
    {
		this.viewport.addChild(this._tilesContainer);
        this.grid.forEach((hex: Hex<Cell>) =>
        {
			hex.size = { xRadius: this.tileWidth, yRadius: this.tileHeight };
            const point = hex.toPoint();
            
            hex.sprites.forEach((s: { sprite: Sprite, zIndex: number }) =>
            {
				console.log(s.zIndex);
				const sprite: Sprite = s.sprite;
                sprite.x = point.x;
                sprite.y = point.y - 128;
				sprite.zIndex = s.zIndex;
                this._tilesContainer.addChild(sprite);
			});			
        });
	}

	private initLocationLayer(hexIds: HexID[]): void
	{
		hexIds.forEach(hexId =>
		{
			const hex = this.getHexFromAbsoluteCoordinates(hexId.x, hexId.y);
			if (hexId.name === 'province')
			{
				if (!this._provinces.has(hexId.id))
				{
					this._provinces.set(hexId.id, []);
				} 
				this._provinces.get(hexId.id).push(hex);
			}
		});

		this._provinces.forEach((val, key) => 
		{
			switch (key)
			{
				case 0:
					this.gridStrategy.renderCellsOutline(val, 0xff0000, RenderType.StraightLine);
					break;
				case 1:
					this.gridStrategy.renderCellsOutline(val, 0xff00ff, RenderType.StraightLine);
					break;
				case 2:
					this.gridStrategy.renderCellsOutline(val, 0x00ff00, RenderType.StraightLine);
					break;
				case 3:
					this.gridStrategy.renderCellsOutline(val, 0xffff00, RenderType.StraightLine);
					break;
				case 4:
					this.gridStrategy.renderCellsOutline(val, 0x00ffff, RenderType.StraightLine);
					break;
				case 5:
					this.gridStrategy.renderCellsOutline(val, 0xff8888, RenderType.StraightLine);
					break;
				case 6:
					this.gridStrategy.renderCellsOutline(val, 0x8888ff, RenderType.StraightLine);
					break;
			}
				
		});
	}

	private initEntityLayer(entities: Entity[]): void
	{
		entities.forEach(entity =>
		{
			const hex = this.getHexFromAbsoluteCoordinates(entity.x, entity.y);
			const tileEntity: TileEntity = new TileEntity(entity, hex);
			this.viewport.addChild(tileEntity);
		});
	}
	
	public getValidTiles(): Hex<Cell>[]
	{
		const hexes: Hex<Cell>[] = [];
		this.grid.forEach((hex: Hex<Cell>) =>
		{
			if (hex.walkable || hex.buildable)
			{
				hexes.push(hex);
			}
		});
		return hexes;
	}

    private initObjectLayer(objects: Object[]): void
    {
        objects.forEach(object =>
        {
            const sprite: Sprite = object.sprite;

            if (sprite)
            {
                sprite.x = object.x;
                sprite.y = object.y;
                sprite.anchor.set(0, 1);
                this.viewport.addChild(sprite);
            }
            if (object.properties)
            {
                const hexCoordinates = this.gridFactory.pointToHex([object.x / this.tileWidth, object.y / this.tileHeight]);
                const hex: Hex<Cell> = this.grid.get(hexCoordinates);
                hex.properties = Array.from(object.properties);
                hex.properties.forEach(properties =>
                {
                    if (properties.name === 'entity')
                    {
						const entityProps: string[] = properties.value.split('.');
						const index: number = parseInt(entityProps[0]); 
						const entityName: string = entityProps[1];
						this.gridStrategy.addStartEntityPrototype(index, hex, entityName);
					}
                });
            }
		});
	}

	public getPolygon(hexagons: Hex<Cell>[]): Polygon[]
	{
		const triangles: Polygon[] = [];
		hexagons.forEach((hex) =>
		{
			const point: Point = hex.toPoint();
			const corners = hex.corners().map(corner => corner.add(point));
			const center = hex.center().add(point);

			for(let dir = 0; dir < corners.length; dir++)
			{
				const p1 = corners[dir];
				const p2 = corners[(dir + 1) % 6];
				triangles.push(new Polygon([new pPoint(center.x, center.y), new pPoint(p1.x, p1.y), new pPoint(p2.x, p2.y)]));
			}
		});
		return triangles;
	}

    public getHexAt(v: Vector): Hex<Cell>
    {
        const viewportPos: Vector = this.viewport.$position;
        const viewportScale: Vector = this.viewport.$scale;
        const x: number = (v.x - viewportPos.x) / (this.tileWidth * viewportScale.x);
        const y: number = (v.y - viewportPos.y) / (this.tileHeight * viewportScale.y);
        const hexCoordinates = this.gridFactory.pointToHex([x, y]);
        const hex: Hex<Cell> = this.grid.get(hexCoordinates);
        return hex;
    }

	public getHexFromAbsoluteCoordinates(x: number, y: number): Hex<Cell>
	{
		const hexCoordinates = this.gridFactory.pointToHex(x / this.tileWidth, y / this.tileHeight);
        const hex: Hex<Cell> = this.grid.get(hexCoordinates);
		return hex;
	}

    public getHex(x: number, y: number): Hex<Cell>
    {
        const hex: Hex<Cell> = this.grid.get([x, y]);
        return hex;
    }

	public getNeighbors(hex: Hex<Cell>): Hex<Cell>[]
	{
		return this.grid.neighborsOf(hex);
	}

	public getWalkableNeighbors(hex: Hex<Cell>): Hex<Cell>[]
	{
		const neighbors = this.getNeighbors(hex);
		for (let i: number = neighbors.length - 1; i > -1; i--)
		{
			if (!neighbors[i].walkable)
				neighbors.splice(i, 1);
		}
		return neighbors;
	}

	public clearPath(): void
	{
		this.getValidTiles().forEach(cell =>
		{
			cell.parent = undefined;
		});
	}
}
import { MapReader, TileProperty, Object, WorldMap } from './map-reader';
import { Vector } from 'vector2d/src/Vec2D';
import { defineGrid, GridFactory, Hex, Point, Grid, PointLike } from 'honeycomb-grid';
import { Graphics, Sprite, Point as pPoint, Polygon } from 'pixi.js';
import { ViewportManager } from '../render/viewport';
import { AssetLoader } from 'src/app/asset-loader';
import { GridStrategy } from './grid-strategy';

export interface Cell
{
    color?: string; 
	isGenerated?: boolean;
    properties: TileProperty[];
	sprites: PIXI.Sprite[];
	walkable: boolean; //units can walk on this tile.
	buildable: boolean; //structures can be built on this tile.
	road: number[]; //units have a speed advantage on this tile.
}

export class GridManager
{
	private roadMap: Map<number, PointLike[]>;
    private gridFactory: GridFactory<Hex<Cell>>;
    private grid: Grid<Hex<Cell>>;
    private tileWidth: number = 147.75;
    private tileHeight: number = 129.5;
	private mapReader: MapReader;

    constructor(private gridStrategy: GridStrategy, private viewport: ViewportManager)
    {
		this.mapReader = new MapReader();
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

    public init(graphics: Graphics): void
    {
		this.initObjectLayer(this.mapReader.hexUnderLayer);
		this.initTileLayer();
		this.gridStrategy.init(graphics);
		this.initObjectLayer(this.mapReader.entities);
		this.mapRoad();
	}

	private mapRoad(): void
	{
		this.roadMap = new Map<number, PointLike[]>();
		this.roadMap.set(0, [{x: 0, y: -1}, {x: 1, y: -1}]);
		this.roadMap.set(1, [{x: 1, y: 0}, {x: 1, y: 0}]);
		this.roadMap.set(2, [{x: 0, y: 1}, {x: 1, y: 1}]);
		this.roadMap.set(3, [{x: -1, y: 1}, {x: 0, y: 1}]);
		this.roadMap.set(4, [{x: -1, y: 0}, {x: -1, y: 0}]);
		this.roadMap.set(5, [{x: -1, y: -1}, {x: 0, y: -1}]);
	}
	
	public getRoadNeighbors(hex: Hex<Cell>): Hex<Cell>[]
	{
		const neighbors: Hex<Cell>[] = [];
		hex.road.forEach((road: number) =>
		{
			const index: number = hex.y % 2;
			const mapCoordinates: PointLike = this.roadMap.get(road)[index];
			const hexCoordinates: PointLike = hex.coordinates();
			const coordinates: PointLike = { x: hexCoordinates.x + mapCoordinates.x, y: hexCoordinates.y + mapCoordinates.y };
			
			neighbors.push(this.grid.get(coordinates));
		});
		console.log(hex.road);
		return neighbors;
	}

    private initTileLayer(): void
    {
        this.grid.forEach((hex: Hex<Cell>) =>
        {
			hex.size = { xRadius: this.tileWidth, yRadius: this.tileHeight };
            const point = hex.toPoint();
            
            hex.sprites.forEach((sprite: Sprite) =>
            {
                sprite.x = point.x;
                sprite.y = point.y - 128;
                this.viewport.addChild(sprite);
			});

			hex.road = [];
			hex.properties.forEach((property) =>
			{
				if (property.name === 'walkable')
				{
					hex.walkable = property.value;
				} if (property.name === 'buildable')
				{
					hex.buildable = property.value;
				} if (property.name === 'tileType')
				{
					const roadstring: string = property.value;
					if (roadstring.indexOf('road') !== -1)
					{
						const roads: number[] = JSON.parse(roadstring.substring(5));
						hex.road = roads;
					}
				}
			});
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
}
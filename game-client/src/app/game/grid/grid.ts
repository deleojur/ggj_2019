import { MapReader, TileProperty, Object, WorldMap } from './map-reader';
import { Vector } from 'vector2d/src/Vec2D';
import { defineGrid, GridFactory, Hex, Point, Grid } from 'honeycomb-grid';
import { Graphics, Sprite, Point as pPoint, Polygon, Container } from 'pixi.js';
import { ViewportManager } from '../render/viewport';
import { EntityManager } from '../../game/entities/entity-manager';
import { Entity } from '../entities/entity';
import { AssetLoader } from 'src/app/asset-loader';
import { Unit } from '../entities/unit';
import { Structure } from '../entities/structure';
import { Queue } from 'simple-fifo-queue';

export enum CellType
{
    Resource = 1
}

export enum SelectionRenderMode
{
    Solid = 0,
    Dotted,
    Corners
}

export interface Cell
{
    color?: string; 
	isGenerated?: boolean;
    properties: TileProperty[];
	sprites: PIXI.Sprite[];
	walkable: boolean; //units can walk on this tile.
	buildable: boolean; //structures can be built on this tile.
	road: boolean; //units have a speed advantage on this tile.
}

export interface Outline
{
	corner1: Point;
	corner2: Point;
	hex: Hex<Cell>;
}

export class GridManager
{
    private gridFactory: GridFactory<Hex<Cell>>;
    private grid: Grid<Hex<Cell>>;
    private tileWidth: number = 147.75;
    private tileHeight: number = 129.5;
	private mapReader: MapReader;
	private entityManager: EntityManager;

	private selectedCellsGraphics: Graphics;
	private validCellsGraphics: Graphics;
	private entityContainer: Container;

    private playerStartPositions: Hex<Cell>[] = [];
    public get $playerPositions(): Hex<Cell>[]
    {
        return this.playerStartPositions;
    }

    constructor(private viewport: ViewportManager, private graphics: Graphics)
    {
		this.mapReader = new MapReader();

		this.selectedCellsGraphics = new Graphics();

		this.validCellsGraphics = new Graphics(); //shows red/green shade depending on whether a cell is valid to move to/build on
		this.entityContainer = new Container();
		this.entityContainer.sortableChildren = true;

		this.graphics.addChild(this.selectedCellsGraphics);
		this.graphics.addChild(this.entityContainer);
	}

	private setZIndex(hex: Hex<Cell>, entity: Entity): void
	{
		entity.zIndex = hex.y;
		if (entity instanceof Unit)
		{
			entity.zIndex++;
		}
	}

	public getEntitiesAtHex(hex: Hex<Cell>): Entity[]
	{
		return this.entityManager.getEntitiesAtHex(hex);
	}

	public moveEntityToHex(entity: Entity, from: Hex<Cell>, to: Hex<Cell>): void
	{
		this.entityManager.moveEntityToHex(entity, from, to);
		entity.moveToHex(to);
		this.setZIndex(to, entity);
	}

	public addEntity(hex: Hex<Cell>, entity: Entity): void
	{
		this.entityContainer.addChild(entity);
		this.setZIndex(hex, entity);
	}

	public createEntity(hex: Hex<Cell>, playerId: string, entityName: string): Entity
	{
		const entity: Entity = this.entityManager.createEntity(hex, playerId, entityName);
		this.addEntity(hex, entity);
		return entity;
	}

	public removeEntity(hex: Hex<Cell>, entity: Entity): void
	{
		this.entityManager.removeEntity(hex, entity);
		this.entityContainer.removeChild(entity);
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

    public initialize(): void
    {
		this.initObjectLayer(this.mapReader.hexUnderLayer);
		this.initTileLayer();
		this.viewport.addChild(this.graphics);
		this.entityManager = new EntityManager();
		this.initObjectLayer(this.mapReader.icons);
		this.graphics.addChild(this.validCellsGraphics);		
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
					hex.road = property.value === 'road';
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
                    if (properties.name === 'playerStart')
                    {
						this.playerStartPositions.push(hex);
						this.createEntity(hex, "1", properties.value);
                    }
                });
            }
        });
	}
	
	public clearValidCells(): void
	{
		this.validCellsGraphics.clear();
	}

	public clearSelectedCells(): void
	{
		this.selectedCellsGraphics.clear();
	}

	private getEdgeCorners(hexagons: Hex<Cell>[]): Outline[]
    {
        const outline: Outline[] = [];
        let neighbor: Hex<Cell> = null;
        hexagons.forEach((hex) =>
        {
            const neighbors: Hex<Cell>[] = this.grid.neighborsOf(hex);
            for(let n = 0; n < neighbors.length; n++)
            {
                neighbor = neighbors[n];
				const point: Point = hex.toPoint();
				const corners = hex.corners().map(corner => corner.add(point));
				
                if(hexagons.indexOf(neighbor) === -1)
                {
                    const p1 = corners[n];
					const p2 = corners[(n + 1) % 6];
                    outline.push({ hex: hex, corner1: p1, corner2: p2 });
                }
            }
        });
        return outline;
	}

	public getTileRing(center: Hex<Cell>, radius: number): Hex<Cell>[]
    {
        const result: Hex<Cell>[] = [];
        let hex: Hex<Cell> = this.grid.get(center.toCartesian
        ({
            q: center.q, r: center.r - radius, s: center.s
        }));
        for (let i = 0; i < 6; i++) //6 because there are 6 sides to any hexagon circle.
        {
            for (let j = 0; j < radius; j++)
            {
                result.push(hex);
                const n = this.grid.neighborsOf(hex)[i];
        
                //TODO: what kind of tile will this be?
                if (n) hex = n;
            }
        }
        return result;
	}

	private isStructure(hex: Hex<Cell>): boolean
	{
		const entities: Entity[] = this.entityManager.getEntitiesAtHex(hex);
		for (let i: number = 0; i < entities.length; i++)
		{
			const entity: Entity = entities[i];
			if (entity instanceof Structure)
			{
				return true;
			}
		}		
		return false;
	}

	private getBuildableCells(hex: Hex<Cell>): Hex<Cell>[]
	{
		const neighbors: Hex<Cell>[] = this.grid.neighborsOf(hex);
		const validCells: Hex<Cell>[] = [];
		neighbors.forEach(n =>
		{			
			if (n.buildable && !this.isStructure(n))
			{
				validCells.push(n);
			}
		});
		return validCells;
	}

	private getValidCells(hex: Hex<Cell>, type: string): Hex<Cell>[]
	{
		switch (type)
		{
			case "build":
				return this.getBuildableCells(hex);
			
			case "move":
				return this.getWalkableCells(hex, 3);
		}
	}

	private getWalkableCells(hex: Hex<Cell>, radius: number): Hex<Cell>[]
	{
		const checkedCells: Hex<Cell>[] = [];
		const uncheckedCells: Queue<{ hex: Hex<Cell>, dist: number }> = new Queue<{ hex: Hex<Cell>, dist: number }>();
		const road: Hex<Cell>[] = [];
		let current: { hex: Hex<Cell>, dist: number } = { hex: hex, dist: 0 };
		do
		{
			const neighbors: Hex<Cell>[] = this.grid.neighborsOf(current.hex);
			neighbors.forEach(n =>
			{
				if (checkedCells.indexOf(n) === -1)
				{
					checkedCells.push(n);
					if ((current.dist + 1 === 1 && n.walkable) ||
						(current.dist + 1 <= radius && n.road && hex.road))
					{
						if (!this.isStructure(n))
						{
							uncheckedCells.Push({ hex: n, dist: current.dist + 1 });
						}
						road.push(n);
					}
				}
			});
			checkedCells.push(current.hex);
			current = uncheckedCells.Front();
			uncheckedCells.Pop();
		} while (!uncheckedCells.Empty());
		return road;
	} 

	public renderValidCells(hex: Hex<Cell>, type: string): Hex<Cell>[]
	{
		const validCells: Hex<Cell>[] = this.getValidCells(hex, type);
		this.renderSelectedCellsOutline(validCells);

		validCells.forEach(cell =>
		{
			const polygons: Polygon[] = this.getPolygon([cell]);
			this.validCellsGraphics.beginFill(0x00ff00, 0.45);
			polygons.forEach(polygon => 
			{
				this.validCellsGraphics.drawPolygon(polygon);
			});		
			this.validCellsGraphics.endFill();
		});

		return validCells;
	}

	public renderSelectedCellsOutline(selection: Hex<Cell>[]): void
	{
		this.selectedCellsGraphics.lineStyle(5, 0xfada5e, 1, 0.5);
		const outline: Outline[] = this.getEdgeCorners(selection);
        for (let i = 0; i < outline.length; i++)
        {
            const corner1 = outline[i].corner1;
            const corner2 = outline[i].corner2;
            // move the "pen" to the first corner
            this.selectedCellsGraphics.moveTo(corner1.x, corner1.y);

            // draw lines to the other corners
            this.selectedCellsGraphics.lineTo(corner2.x, corner2.y);
		}
		this.selectedCellsGraphics.lineStyle(0);
	}

	private getPolygon(hexagons: Hex<Cell>[]): Polygon[]
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
}
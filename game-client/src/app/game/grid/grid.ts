import { MapReader, TileProperty, Object, WorldMap } from './map-reader';
import { Vector } from 'vector2d/src/Vec2D';
import { defineGrid, GridFactory, Hex, Point, Grid } from 'honeycomb-grid';
import { Graphics, Sprite, Point as pPoint, Polygon } from 'pixi.js';
import { ViewportManager } from '../render/viewport';
import { EntityManager } from '../../game/entities/entity-manager';
import { Entity } from '../entities/entity';
import { AssetLoader } from 'src/app/asset-loader';

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
	entity?: Entity;
    properties: TileProperty[];
	sprites: PIXI.Sprite[];
	walkable: boolean;
	buildable: boolean;
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

    private playerStartPositions: Hex<Cell>[] = [];
    public get $playerPositions(): Hex<Cell>[]
    {
        return this.playerStartPositions;
    }

    constructor(private viewport: ViewportManager, private graphics: Graphics)
    {
		this.mapReader = new MapReader();
		this.entityManager = new EntityManager();

		this.selectedCellsGraphics = new Graphics();
		this.validCellsGraphics = new Graphics();

		this.graphics.addChild(this.selectedCellsGraphics);
		this.graphics.addChild(this.validCellsGraphics);
	}

	public createEntity(origin: Hex<Cell>, playerId: string, entityName: string): Entity
	{
		const entity: Entity = this.entityManager.createEntity(origin, playerId, entityName);
		origin.entity = entity;
		const pos = origin.toPoint();
		entity.position = new pPoint(pos.x, pos.y - 128);
		this.viewport.addChild(entity);
		return entity;
	}

	public removeEntity(origin: Hex<Cell>): void
	{
		const entity: Entity = this.entityManager.removeEntity(origin);
		origin.entity = undefined;
		this.viewport.removeChild(entity);
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

    public initLayers(): void
    {
        this.initObjectLayer(this.mapReader.hexUnderLayer);
        this.initTileLayer();
        this.initObjectLayer(this.mapReader.icons);
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
				} else if (property.name === 'buildable')
				{
					hex.buildable = property.value;
				}
			});
        });
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
                hex.properties.push(...Array.from(object.properties));

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

	public fillBuildableSelection(selection: Hex<Cell>[]): void
	{
		for (let i = 0; i < selection.length; i++)
		{
			const cell: Hex<Cell> = selection[i];
			const polygons: Polygon[] = this.getPolygon([cell]);
			this.validCellsGraphics.beginFill((cell.buildable && !cell.entity) ? 0x00ff00 : 0xff0000, 0.45);
			polygons.forEach(polygon => 
			{
				this.validCellsGraphics.drawPolygon(polygon);
			});		
			this.validCellsGraphics.endFill();
		}		
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

	private renderSelectedCellsOutline(selection: Hex<Cell>[]): void
	{
		const outline: Outline[] = this.getEdgeCorners(selection);
        for (let i = 0; i < outline.length; i++)
        {
            const corner1 = outline[i].corner1;
            const corner2 = outline[i].corner2;
            // move the "pen" to the first corner
            this.validCellsGraphics.moveTo(corner1.x, corner1.y);

            // draw lines to the other corners
            this.validCellsGraphics.lineTo(corner2.x, corner2.y);
		}
	}

	public renderHexCorners(selection: Hex<Cell>[]): void
    {
		this.selectedCellsGraphics.lineStyle(6, 0xfada5e, 1, 0.5);

		const outline: Outline[] = this.getEdgeCorners(selection);
        const length = outline.length;
        for (let i = 0; i < length; i++)
        {
            let l: number = i - 1;
			if (l < 0) l = length - 1;
			
			const center: Point = outline[i].hex.center().add(outline[i].hex.toPoint());
			const c: Vector = new Vector(center.x, center.y);
			const current: Vector = new Vector(outline[i].corner1.x, outline[i].corner1.y);
			const left: Vector = new Vector(outline[l].corner1.x, outline[l].corner1.y);
			const right: Vector = new Vector(outline[i].corner2.x, outline[i].corner2.y);

            const v1 = current.clone().add(c.clone().subtract(current).normalize().multiplyByScalar(10));
            const v2 = left.clone().add(c.clone().subtract(left).normalize().multiplyByScalar(10));
            const v3 = right.clone().add(c.clone().subtract(right).normalize().multiplyByScalar(10));
    
            const leftCorner = v1.clone().add(v2.subtract(v1).normalize().multiplyByScalar(25))
            const rightCorner = v1.clone().add(v3.subtract(v1).normalize().multiplyByScalar(25))

            this.selectedCellsGraphics.moveTo(leftCorner.x, leftCorner.y);
            this.selectedCellsGraphics.lineTo(v1.x, v1.y);
            this.selectedCellsGraphics.lineTo(rightCorner.x, rightCorner.y);
		}
		
		this.selectedCellsGraphics.lineStyle(0);
    }

    public renderValidCells(selection: Hex<Cell>[]): void
    {
		this.fillBuildableSelection(selection);

		this.validCellsGraphics.lineStyle(5, 0xfada5e, 1, 0.5);
		this.renderSelectedCellsOutline(selection);
		this.validCellsGraphics.lineStyle(0);
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
import { MapReader, TileProperty, Object } from './map-reader';
import { Vector } from 'vector2d/src/Vec2D';
import { defineGrid, GridFactory, Hex, Point, Grid } from 'honeycomb-grid';
import { Graphics, Sprite } from 'pixi.js';
import { ViewportManager } from '../render/viewport';

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
}

export class GridManager
{
    private gridFactory: GridFactory<Hex<Cell>>;
    private grid: Grid<Hex<Cell>>;
    private tileWidth: number = 147.75;
    private tileHeight: number = 129.5;
    private mapReader: MapReader;

    private playerStartPositions: Hex<Cell>[] = [];
    public get $playerPositions(): Hex<Cell>[]
    {
        return this.playerStartPositions;
    }

    constructor(private viewport: ViewportManager, private graphics: Graphics)
    {
        this.mapReader = new MapReader();
    }

    private initHexagonalGrid(onInitialized: (width: number, height: number) => void): void
    {
        this.gridFactory = defineGrid();
        this.mapReader.loadWorldMap((width: number, height: number) =>
        {
            this.grid = this.gridFactory.rectangle({ width: width, height: height });

            this.grid.forEach(hex =>
            {
                hex.sprites = [];
                hex.properties = [];
            });
    
            const r = this.tileWidth;
            const w = 1.732 * this.tileHeight;
            const h = r * 2;  
    
            return onInitialized(w * (width * 2 + 2), h * (height + 1) + r * height);
        });
    }

    public generateWorld(onready: (width: number, height: number) => void): void
    {
        this.initHexagonalGrid((width: number, height: number) =>
        {
            this.mapReader.parseWorldMap(this.grid);
            return onready(width, height);
        });
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
        });
    }

    private initObjectLayer(objects: Object[]): void
    {
        console.log(objects);
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
                    if (properties.value === 'PlayerStartPosition')
                    {
                        this.playerStartPositions.push(hex);
                    }
                });
            }
        });
    }

    private renderSelection(selection: Hex<Cell>[]): void
    {
        const corners: Point[] = this.getEdgeCorners(selection);
        for (let i = 0; i < corners.length; i+= 2)
        {
            const corner1 = corners[i];
            const corner2 = corners[i + 1];
            // move the "pen" to the first corner
            this.graphics.moveTo(corner1.x, corner1.y);

            // draw lines to the other corners
            this.graphics.lineTo(corner2.x, corner2.y);
        }        
    }

    private getEdgeCorners(hexagons: Hex<Cell>[]): Point[]
    {
        const edges: Point[] = [];
        let neighbor: Hex<Cell> = null;
        hexagons.forEach((hex) =>
        {
            const neighbors: Hex<Cell>[] = this.grid.neighborsOf(hex);
            for(let dir = 0; dir < neighbors.length; dir++)
            {
                neighbor = neighbors[dir];
                const point: Point = hex.toPoint();
                const corners = hex.corners().map(corner => corner.add(point));
               
                if(hexagons.indexOf(neighbor) === -1)
                {
                    const p1 = corners[dir];
                    const p2 = corners[(dir + 1) % 6];
                    edges.push(p1, p2);
                }
            }
        });
        return edges;
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

    public renderHex(hex: Hex<Cell>, color: number): void
    {        
        if (hex)
        {
            this.graphics.clear();
            this.graphics.lineStyle(8, color, 1, 0.5, );

            const neighbors: Hex<Cell>[] = this.grid.neighborsOf(hex);
            neighbors.push(hex);

            this.renderSelection(neighbors);
            this.graphics.endFill();
        }
    }
}
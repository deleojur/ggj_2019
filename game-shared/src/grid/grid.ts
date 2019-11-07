import { MapReader, TileProperty, Icon } from './map-reader';
import { Cell } from './grid';
import { Vector } from 'vector2d/src/Vec2D';
import { defineGrid, GridFactory, Hex, Point, Grid } from 'honeycomb-grid';
import { Graphics, Sprite } from 'pixi.js';
import { ViewportManager } from '../viewport';

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
    private tileWidth: number = 148;
    private tileHeight: number = 129.5;
    private mapReader: MapReader;

    constructor(private viewport: ViewportManager, private graphics: Graphics)
    {
        this.mapReader = new MapReader();
        //game.$onClick.subscribe(v => this.onClick(v));
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

    public initSprites(): void
    {
        this.initTileLayerSprites();
        this.initObjectLayerSprites();
    }

    private initTileLayerSprites(): void
    {
        this.grid.forEach((hex: Hex<Cell>) =>
        {
            hex.size = { xRadius: this.tileWidth, yRadius: this.tileHeight };
            const point = hex.toPoint();
            
            hex.sprites.forEach((sprite: Sprite) =>
            {
                sprite.x = point.x;
                sprite.y = point.y - 125;
                this.viewport.addChild(sprite);
            });
        });
    }

    private initObjectLayerSprites(): void
    {
        const icons: Icon[] = this.mapReader.icons;
        icons.forEach(icon =>
        {
            const sprite: Sprite = icon.sprite;
            sprite.x = icon.x;
            sprite.y = icon.y - 125;
            this.viewport.addChild(sprite);
        });
    }

    private renderSelectionCorners(corners: Point[]): void
    {
        const length = corners.length;
        for (let i = 0; i < length; i++)
        {
            let left: number = i - 1;
            if (left < 0) left = length - 1;

            const right: number = (i + 1) % length;
            const v1: Vector = new Vector(corners[i].x, corners[i].y);
            const v2: Vector = new Vector(corners[left].x, corners[left].y);
            const v3: Vector = new Vector(corners[right].x, corners[right].y);
    
            const blaat1 = v1.clone().add(v2.clone().subtract(v1).normalize().multiplyByScalar(25))
            const blaat2 = v1.clone().add(v3.clone().subtract(v1).normalize().multiplyByScalar(25))

            this.graphics.moveTo(blaat1.x, blaat1.y);
            this.graphics.lineTo(v1.x, v1.y);
            this.graphics.lineTo(blaat2.x, blaat2.y);
        }
    }

    private renderSelectionSolid(corners: Point[]): void
    {
        // separate the first from the other corners
        const [firstCorner, ...otherCorners] = corners;

        // move the "pen" to the first corner
        this.graphics.moveTo(firstCorner.x, firstCorner.y)

        // draw lines to the other corners
        otherCorners.forEach(({ x, y }) => this.graphics.lineTo(x, y))

        // finish at the first corner
        this.graphics.lineTo(firstCorner.x + 3, firstCorner.y + 3);
    }

    private renderSelection(selection: Hex<Cell>[], renderMode: SelectionRenderMode = SelectionRenderMode.Solid): void
    {
        selection.forEach(hex =>
        {
            if (hex)
            {
                const point: Point = hex.toPoint();
                const corners = hex.corners().map(corner => corner.add(point));
    
                switch (renderMode)
                {
                    case SelectionRenderMode.Solid:
                        this.renderSelectionSolid(corners);
                        break;
                    case SelectionRenderMode.Corners:
                        this.renderSelectionCorners(corners);
                        break;
                }
            }       
        });
    }

    onClick(v: Vector)
    {
        const viewportPos: Vector = this.viewport.$position;
        const viewportScale: Vector = this.viewport.$scale;
        const x: number = (v.x - viewportPos.x) / (this.tileWidth * viewportScale.x);
        const y: number = (v.y - viewportPos.y) / (this.tileHeight * viewportScale.y);
        const hexCoordinates = this.gridFactory.pointToHex([x, y]);
        const hex: Hex<Cell> = this.grid.get(hexCoordinates);
        if (hex)
        {
            this.graphics.clear();
            this.graphics.lineStyle(10, 0x00ff00, 1, 0.5);

            const snap: Point = hex.toPoint().add(hex.center());
            this.viewport.snapToPosition(snap.x, snap.y);

            const neighbors: Hex<Cell>[] = this.grid.neighborsOf(hex);
            this.renderSelection(neighbors, SelectionRenderMode.Corners);
            this.renderSelection([hex], SelectionRenderMode.Solid);
            this.graphics.endFill();
        }        
    }
}
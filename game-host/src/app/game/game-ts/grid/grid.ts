import { MapReader, TileProperty, Icon } from './map-reader';
import { Cell } from './grid';
import { ClientData } from '../../../../services/connection.service';
import { Vector } from 'vector2d/src/Vec2D';
import { iGame } from '../../game.component';
import { defineGrid, GridFactory, Hex, Point, Grid, PointLike } from 'honeycomb-grid';
import { Graphics, Sprite, Texture } from 'pixi.js';
import { GridUtils } from './grid-utils';

export enum CellType
{
    Resource = 1,
    
}

export interface Cell
{
    color?: string; 
    isGenerated?: boolean;
    properties: TileProperty[];
    sprites: PIXI.Sprite[];
}

export interface iGrid
{
    generateWorld(onready: (width: number, height: number) => void): void;    
}

export class GridManager implements iGrid
{
    private gridFactory: GridFactory<Hex<Cell>>;
    private grid: Grid<Hex<Cell>>;
    private tileWidth: number = 148;
    private tileHeight: number = 129.5;
    private graphics: Graphics;
    private mapReader: MapReader;

    constructor(private game: iGame)
    {
        this.graphics = game.$graphics;
        this.mapReader = new MapReader();
        game.$onClick.subscribe(v => this.onClick(v));
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
        this.grid.forEach((hex: Hex<Cell>) =>
        {
            hex.size = { xRadius: this.tileWidth, yRadius: this.tileHeight };
            const point = hex.toPoint();
            
            hex.sprites.forEach(sprite => 
            {
                sprite.x = point.x;
                sprite.y = point.y - 125;
                this.game.$viewport.addChild(sprite);
            });
        });

        const icons: Icon[] = this.mapReader.icons;
        icons.forEach(icon =>
        {
            const sprite: Sprite = icon.sprite;
            sprite.x = icon.x;
            sprite.y = icon.y - 125;
            this.game.$viewport.addChild(sprite);
        });
    }

    private renderSelection(selection: Hex<Cell>[]): void
    {
        this.graphics.clear();
        this.graphics.lineStyle(10, 0xffd900, 1, 0.5);

        selection.forEach(hex =>
        {
            const point: Point = hex.toPoint();
            const corners = hex.corners().map(corner => corner.add(point));

            // separate the first from the other corners
            const [firstCorner, ...otherCorners] = corners;
    
            // move the "pen" to the first corner
            this.graphics.moveTo(firstCorner.x, firstCorner.y)
            // draw lines to the other corners
            otherCorners.forEach(({ x, y }) => this.graphics.lineTo(x, y))
            // finish at the first corner
            this.graphics.lineTo(firstCorner.x + 3, firstCorner.y + 3);
        });        
        this.graphics.endFill();
    }

    onClick(v: Vector)
    {
        const viewportPos: Vector = this.game.$viewport.$position;
        const viewportScale: Vector = this.game.$viewport.$scale;
        const x: number = (v.x - viewportPos.x) / (this.tileWidth * viewportScale.x);
        const y: number = (v.y - viewportPos.y) / (this.tileHeight * viewportScale.y);
        const hexCoordinates = this.gridFactory.pointToHex([x, y]);
        const hex: Hex<Cell> = this.grid.get(hexCoordinates);
        if (hex)
        {
            const snap: Point = hex.toPoint().add(hex.center());
            this.game.$viewport.snapToPosition(snap.x, snap.y);
            this.renderSelection([hex]);
        }
    }
}
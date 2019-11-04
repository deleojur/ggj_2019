import { iViewport } from './../../../../../../game-client/src/app/game/game-ts/viewport';
import { Viewport } from 'pixi-viewport';
import { MapReader } from './map-reader';
import { Cell } from './grid';
import { ClientData } from '../../../../services/connection.service';
import { Vector } from 'vector2d/src/Vec2D';
import { iGame } from '../../game.component';
import { defineGrid, GridFactory, Hex, Point, Grid, PointLike } from 'honeycomb-grid';
import { Graphics, Sprite } from 'pixi.js';
import { GridGenerator, iGridGenerator } from './grid-generator';

export enum CellType
{
    Resource = 1,
    Player = 2,
    Empty = 0
}

export interface Cell
{
    color?: string;
    type?: CellType; 
    isGenerated?: boolean;
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
    private hexagonSize: number = 95;
    private graphics: Graphics;
    private mapReader: MapReader;

    private selectedHex: Hex<Cell>;
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
                hex.color = '0xffffff';
                hex.type = CellType.Empty;
                hex.sprites = [];
            });
    
            const r = this.hexagonSize;
            const w = 1.732 * this.hexagonSize;
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
            hex.size = { xRadius: this.hexagonSize, yRadius: this.hexagonSize };
            const point = hex.toPoint();
            
            hex.sprites.forEach(sprite => 
            {
                sprite.x = point.x - 20;
                sprite.y = point.y;
                this.game.$viewport.addChild(sprite);
            });
        });
    }

    public render(): void
    {
        this.graphics.clear();
        this.graphics.lineStyle(7, 0xffd900, 1, 0.5);        
        this.grid.forEach((hex: Hex<Cell>) => 
        {            
            this.graphics.beginFill(parseInt(hex.color));

            //set the size of hexagons
            hex.size = { xRadius: this.hexagonSize, yRadius: this.hexagonSize };           

            const point = hex.toPoint()
            // add the hex's position to each of its corner points
            const corners = hex.corners().map(corner => corner.add(point))
            // separate the first from the other corners
            const [firstCorner, ...otherCorners] = corners;
        
            // move the "pen" to the first corner
            this.graphics.moveTo(firstCorner.x, firstCorner.y)
            // draw lines to the other corners
            otherCorners.forEach(({ x, y }) => this.graphics.lineTo(x, y))
            // finish at the first corner
            this.graphics.lineTo(firstCorner.x, firstCorner.y);
        });        
        this.graphics.endFill();
    }
    
    onClick(v: Vector)
    {
        const viewportPos: Vector = this.game.$viewport.$position;
        const viewportScale: Vector = this.game.$viewport.$scale;
        const x: number = (v.x - viewportPos.x) / (this.hexagonSize * viewportScale.x);
        const y: number = (v.y - viewportPos.y) / (this.hexagonSize * viewportScale.y);
        const hexCoordinates = this.gridFactory.pointToHex([x, y]);
        const hex: Hex<Cell> = this.grid.get(hexCoordinates);
        if (hex) 
        {
            if (this.selectedHex) this.selectedHex.color = '';
            this.selectedHex = hex;
            this.selectedHex.color = '0x00ff00';
            const snap: Point = hex.toPoint().add(hex.center());
            this.game.$viewport.snapToPosition(snap.x, snap.y);
            this.render();
        }
    }
}
import { Vector } from 'vector2d/src/Vec2D';
import { iGame } from './../game.component';
import { defineGrid, GridFactory, Hex, Point, Grid } from 'honeycomb-grid';
import { Graphics } from 'pixi.js';

class Hexagon
{
    x? : number;
    y? : number;
}

export interface iGrid
{
    readonly $width: number;
    readonly $height: number;
}

export class GridManager implements iGrid
{
    private gridFactory: GridFactory<Hex<{ }>>;
    private grid: Grid<Hex<{ }>>;
    private hexagonSize: number = 100;
    private radius: number = 5; //should be odd number.
    private graphics: Graphics;
    private selectedHex: Hexagon = new Hexagon();

    private width: number;
    public get $width(): number
    {
        return this.width;
    }

    private height: number;
    public get $height(): number
    {
        return this.height;
    }

    constructor(private game: iGame)
    {
        this.graphics = game.$graphics;
        game.$onClick.subscribe(v => this.onClick(v));
        this.initHexagonalGrid();
    }

    initHexagonalGrid(): void
    {
        this.gridFactory = defineGrid();
        this.grid = this.gridFactory.hexagon({ radius: this.radius, center: { x: 5, y: 5 } });
        
        const r = this.hexagonSize;
        const w = 1.732 * this.hexagonSize;
        const h = r * 2;

        this.width = w * (this.radius * 2 + 2);
        this.height = h * (this.radius + 1) + r * this.radius;
        
        this.render();
    }

    public render(): void
    {
        this.graphics.clear();
        this.graphics.lineStyle(7, 0xffd900, 1, 0.5);
        this.grid.forEach((hex: Hex<any>) => 
        {
            const selected = this.selectedHex.x === hex.x && this.selectedHex.y === hex.y;
            this.graphics.beginFill(selected ? 0x00ff00 : 0xe74c3c); // Red

            //set the size of hexagons
            hex.size = { xRadius: this.hexagonSize, yRadius: this.hexagonSize };           

            const point = hex.toPoint()
            // add the hex's position to each of its corner points
            const corners = hex.corners().map(corner => corner.add(point))
            // separate the first from the other corners
            const [firstCorner, ...otherCorners] = corners
        
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
        const hex = this.grid.get(hexCoordinates);
        if (hex) 
        {
            this.selectedHex.x = hex.x;
            this.selectedHex.y = hex.y;
            const snap: Point = hex.toPoint().add(hex.center());
            this.game.$viewport.snapToPosition(snap.x, snap.y);
            this.render();
        }
    }
}
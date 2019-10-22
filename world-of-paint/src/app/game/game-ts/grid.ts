import { Vector } from 'vector2d/src/Vec2D';
import { iGame } from './../game.component';
import { defineGrid, GridFactory, Hex } from 'honeycomb-grid';
import { Graphics } from 'pixi.js';

class Hexagon
{
    selected?: boolean;
}

export class GridManager 
{
    private gridFactory: GridFactory<Hex<any>>;
    private grid: any;
    private gridSize: number = 100;
    private graphics: Graphics;
    private selectedHex: Hexagon = new Hexagon();

    constructor(private game: iGame)
    {
        this.graphics = game.$graphics;
        game.$onClick.subscribe(v => this.onClick(v));
        this.initHexagonalGrid();
    }

    initHexagonalGrid(): void
    {
        this.gridFactory = defineGrid();
        this.grid = this.gridFactory.rectangle({ width: 4, height: 4 });
        
        this.render();
    }

    public render(): void
    {
        this.graphics.clear();
        this.graphics.lineStyle(2, 0xffd900, 1);
        this.grid.forEach((hex: Hex<any>) => 
        {
            this.graphics.beginFill(hex.selected ? 0x00ff00 : 0xe74c3c); // Red

            //set the size of hexagons
            hex.size = { xRadius: this.gridSize, yRadius: this.gridSize };

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
        const x: number = (v.x - viewportPos.x) / (this.gridSize * viewportScale.x);
        const y: number = (v.y - viewportPos.y) / (this.gridSize * viewportScale.y);
        const hexCoordinates = this.gridFactory.pointToHex([x, y]);
        const hex = this.grid.get(hexCoordinates);
        console.log(hex);
        if (hex) 
        {
            if (hex != this.selectedHex)
            {
                hex.selected = true;
                this.selectedHex.selected = false;
                this.selectedHex = hex;
                this.render();
            }
        }
    }
}
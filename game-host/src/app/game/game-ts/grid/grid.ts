import { Cell } from './grid';
import { ClientData } from '../../../../services/connection.service';
import { Vector } from 'vector2d/src/Vec2D';
import { iGame } from '../../game.component';
import { defineGrid, GridFactory, Hex, Point, Grid, PointLike } from 'honeycomb-grid';
import { Graphics } from 'pixi.js';
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
}

export interface iGrid
{
    generateWorld(clients: ClientData[]): Vector;
}

export class GridManager implements iGrid
{
    private gridFactory: GridFactory<Hex<Cell>>;
    private grid: Grid<Hex<Cell>>;
    private gridGen: iGridGenerator;
    private hexagonSize: number = 100;
    private graphics: Graphics;

    private selectedHex: Hex<Cell>;
    constructor(private game: iGame)
    {
        this.graphics = game.$graphics;
        this.gridGen = new GridGenerator();
        game.$onClick.subscribe(v => this.onClick(v));
    }

    public initHexagonalGrid(radius: number): Vector
    {
        this.gridFactory = defineGrid();
        this.grid = this.gridFactory.hexagon({ radius: radius, center: { x: radius, y: radius } });

        this.grid.forEach(hex =>
        {
            hex.type = CellType.Empty;
        });

        const r = this.hexagonSize;
        const w = 1.732 * this.hexagonSize;
        const h = r * 2;
        return new Vector(
            w * (radius * 2 + 2), 
            h * (radius + 1) + r * radius);
    }

    public generateWorld(clients: ClientData[]): Vector
    {
        const radius = clients.length + 2;
        const size: Vector = this.initHexagonalGrid(radius);

        const center = this.grid.get(Math.floor(this.grid.length / 2));
        const playerPositions: Hex<Cell>[] = this.calculatePlayerPositions(clients, center, radius, clients.length);
        this.calculateHexTileTypes(center, radius);
        this.gridGen.generateLevel(this.grid, playerPositions).subscribe(() => 
        {
            this.render();
        });
        this.render();
        return size;
    }

    private calculateDistanceBetweenHexes(hex1: Hex<Cell>, hex2: Hex<Cell>): number
    {
        const qDiff = Math.abs(hex1.q - hex2.q);
        const rDiff = Math.abs(hex1.r - hex2.r);
        const sDiff = Math.abs(hex2.s - hex2.s);
        return (qDiff + rDiff + sDiff) / 2;
    }

    private rotatedHexAroundCenter(center: Hex<Cell>, point: Hex<Cell>, n: number = 0): Hex<Cell>
    {
        const difQ: number = point.q - center.q;
        const difR: number = point.r - center.r;
        const difS: number = point.s - center.s;
        
        const rotQ: number = -difR;
        const rotR: number = -difS;
        const rotS: number = -difQ;
        
        const transQ = center.q + rotQ;
        const transR = center.r + rotR;
        const transS = center.s + rotS;

        const cartesian = center.toCartesian({q: transQ, r: transR, s: transS});
        const r = this.grid.get(cartesian);
        
        if (--n > 0)
        {
            return this.rotatedHexAroundCenter(center, r, n);
        }
        return this.grid.get(r);        
    }

    private getPointAtDistFromCenter(center: Hex<Cell>, distToCenter: number): Hex<Cell>
    {
        const positionAsPoint: PointLike = center.toCartesian(
        {
            q: center.q + distToCenter, r: center.r - distToCenter, s: center.s
        });
        return this.grid.get(positionAsPoint);
    }

    private calculateRing(center: Hex<Cell>, radius: number): Hex<Cell>[]
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

    private 

    private calculateHexTileTypes(center: Hex<Cell>, radius: number): Hex<Cell>[]
    {
        const result: Hex<Cell>[] = [];
        for (let i = 0; i <= radius; i++)
        {
            result.concat(this.calculateRing(center, i));
        }
        return result;
    }

    private calculatePlayerPositions(clients: ClientData[], center: Hex<Cell>, radius: number, distToCenter: number): Hex<Cell>[]
    {
        const playerPositions: Hex<Cell>[] =  [];
        const playerRotation: number[][] = [[0], [3], [2, 2], [2, 1, 2], [1, 1, 1, 1], [1, 1, 1, 1, 1]];
        let p: Hex<Cell> = this.getPointAtDistFromCenter(center, distToCenter);
        for (let i = 0; i < clients.length; i++)
        {
            p.color = clients[i].color;
            p.type = CellType.Player;
            playerPositions.push(p);
            p = this.rotatedHexAroundCenter(center, p, playerRotation[clients.length - 1][i]);
        }
        return playerPositions;
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
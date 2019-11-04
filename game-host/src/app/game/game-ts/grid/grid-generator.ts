import { Grid, Hex } from 'honeycomb-grid';
import { CellType, Cell } from './grid';
import * as _ from 'lodash';
import { Subject } from 'rxjs';

export interface iGridGenerator
{
    //generateLevel(grid: Grid, playerPositions: number[]): Subject<Grid>;
}

export class GridGenerator implements iGridGenerator
{
    /*gridClone: Grid;
    closedCells: Hex<Cell>[];
    openCells: Hex<Cell>[]; //cells that have not been checked but have been opened and will check themselves still.
    constructor()
    {
        
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

    private calculateHexTileTypes(center: Hex<Cell>, radius: number): Hex<Cell>[]
    {
        const result: Hex<Cell>[] = [];
        for (let i = 0; i <= radius; i++)
        {
            result.concat(this.calculateRing(center, i));
        }
        return result;
    }

    private calculatePlayerPositions(clients: ClientData[], center: Hex<Cell>, radius: number, distToCenter: number): number[]
    {
        const playerPositions: number[] =  [];
        const playerRotation: number[][] = [[0], [3], [2, 2], [2, 1, 2], [1, 1, 1, 1], [1, 1, 1, 1, 1]];
        let p: Hex<Cell> = this.getPointAtDistFromCenter(center, distToCenter);
        for (let i = 0; i < clients.length; i++)
        {
            p.color = clients[i].color;
            p.type = CellType.Player;
            playerPositions.push(i);
            p = this.rotatedHexAroundCenter(center, p, playerRotation[clients.length - 1][i]);
        }
        return playerPositions;
    }*/
}
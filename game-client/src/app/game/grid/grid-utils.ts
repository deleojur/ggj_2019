import { Grid, Hex, Point, PointLike } from 'honeycomb-grid';
import { Cell } from './grid';
import * as _ from 'lodash';

export class GridUtils
{
    constructor(private grid: Grid<Hex<Cell>>)
    {
    
    }    

    /* public calculateOuterCorners(selection: Hex<Cell>[]): Point[]
    {
        const result: Point[] = [];
        const blaat: {} = {};
        selection.forEach(hex =>
        {
            const point: Point = hex.toPoint();
            const corners = hex.corners().map(corner => corner.add(point));

            corners.forEach(corner =>
            {
                const id = JSON.stringify(corner);
                if (blaat[id])
                {
                    blaat[id]++;
                } else blaat[id] = 1;
            });
        });

        for (let id in blaat)
        {
            if (blaat.hasOwnProperty(id))
            {
                const amount = blaat[id];
                if (amount < 3)
                {
                    result.push(JSON.parse(id));
                }
            }
        }

        return result;
    } */

    public static HexToPoint(hex: Hex<Cell>): Point
    {
        return hex.toPoint().add(hex.center());
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
                if (n) hex = n;
            }
        }
        return result;
    }
}
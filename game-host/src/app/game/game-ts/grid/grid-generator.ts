import { Grid, Hex } from 'honeycomb-grid';
import { CellType, Cell } from './grid';
import * as _ from 'lodash';
import { Subject } from 'rxjs';

export interface iGridGenerator
{
    generateLevel(grid: Grid, playerPositions: Hex<Cell>[]): Subject<Grid>;
}

export class GridGenerator implements iGridGenerator
{
    constructor()
    {
    }

    private generateNoise(grid: Grid, initialPercentage: number)
    {
        for (let i = 0; i < grid.length; i++)
        {
            const hex: Hex<Cell> = grid[i];
            if (hex.type !== CellType.Player)
            {
                if (Math.random() < initialPercentage)
                {
                    hex.type = CellType.Resource;
                    hex.color = '0xffffff';
                } 
            }
        }
    }

    private inspectNeighbor(grid: Grid, checkedNodes: Hex<Cell>[], parent: Hex<Cell>, onDone: Subject<Grid>): void
    {
        //if the node has been checked, there is not need to check it again.
        if (checkedNodes.indexOf(parent) < 0)
        {            
            checkedNodes.push(parent);
            const neighbors: Hex<Cell>[] = grid.neighborsOf(parent);

            setTimeout(() => 
            {
                neighbors.forEach((neighbor: Hex<Cell>) =>
                {
                    //only check neighbors that are not undefined.
                    if (neighbor && checkedNodes.indexOf(neighbor) < 0)
                    {
                        this.inspectNeighbor(grid, checkedNodes, neighbor, onDone);
                            neighbor.color = '0';
                    }
                });
            onDone.next(grid);
            }, 1000);
        }        
    }

    public generateLevel(grid: Grid, playerPositions: Hex<Cell>[]): Subject<Grid>
    {
        this.generateNoise(grid, 0.4);
        const onIterationDone: Subject<Grid> = new Subject<Grid>();
        const checkedNodes: Hex<Cell>[] = [];
        for (let i = 0; i < playerPositions.length; i++)
        {           
            const playerHex: Hex<Cell> = playerPositions[i];
            this.inspectNeighbor(grid, checkedNodes, playerHex, onIterationDone);        
        }
        return onIterationDone;
    }
}
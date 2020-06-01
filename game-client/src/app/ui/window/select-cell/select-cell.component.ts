import { Component, OnInit } from '@angular/core';
import { GameManager } from 'src/app/game/game-manager';
import { GridManager } from 'src/app/game/grid/grid';
import { Hex } from 'honeycomb-grid';
import { Cell } from 'src/app/game/grid/grid';

@Component({
  selector: 'app-select-cell',
  templateUrl: './select-cell.component.html',
  styleUrls: ['../window.component.scss', './select-cell.component.scss']
})
export class SelectCellComponent implements OnInit
{
	public width: string = '25vh';
	public top: string = '-20px';

	data: any;
	grid: GridManager;

	constructor() 
	{
		this.grid = GameManager.instance.grid;
	}

	ngOnInit() 
	{
		const neighbors: Hex<Cell>[] = this.grid.getNeighbors(this.data.origin);
		this.grid.renderSelection(neighbors, 0x00ff00);
	}
	  
	closeWindow(): void
	{
		this.grid.clearRendering();
	}
}

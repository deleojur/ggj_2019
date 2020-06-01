import { Component, OnInit } from '@angular/core';
import { GameManager } from 'src/app/game/game-manager';
import { GridManager } from 'src/app/game/grid/grid';
import { Hex } from 'honeycomb-grid';
import { Cell } from 'src/app/game/grid/grid';
import { InnerWindowComponent } from '../window.component';

@Component({
  selector: 'app-select-cell',
  templateUrl: './select-cell.component.html',
  styleUrls: ['../window.component.scss', './select-cell.component.scss']
})
export class SelectCellComponent implements OnInit, InnerWindowComponent
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
		GameManager.instance.renderValidCells(this.data.origin);
	}

	backToPreviousMenu(): void
	{
		GameManager.instance.windowManager.goToPreviousWindow();
	}
	  
	beforeCloseWindow(n: number): void
	{
		GameManager.instance.clearValidCells();
		if (n == 0)
		{
			this.grid.clearSelectedCells();
		}
	}

	beforeOpenWindow(n: number): void
	{

	}

	afterCloseWindow(n: number): void
	{

	}

	afterOpenWindow(n: number): void
	{
		
	}
}

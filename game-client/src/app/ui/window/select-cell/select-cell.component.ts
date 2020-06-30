import { Component, OnInit } from '@angular/core';
import { GameManager } from 'src/app/game/game-manager';
import { GridManager } from 'src/app/game/grid/grid';
import { Hex } from 'honeycomb-grid';
import { Cell } from 'src/app/game/grid/grid';
import { InnerWindowComponent } from '../window.component';
import { Subscription } from 'rxjs';
import { BehaviorInformation, Entity } from 'src/app/game/entities/entity';
import { TurnInformation } from 'src/app/game/turns/turn-command';

@Component({
  selector: 'app-select-cell',
  templateUrl: './select-cell.component.html',
  styleUrls: ['../window.component.scss', './select-cell.component.scss']
})
export class SelectCellComponent implements OnInit, InnerWindowComponent
{
	public width: string = '25vh';
	public top: string = '-20px';

	private hex: Hex<Cell>;
	private _behavior: BehaviorInformation = null;
	private _entity: Entity;

	private _validCells: Hex<Cell>[] = null;
	private hexSubscription: Subscription;

	data: any;	
	grid: GridManager;

	constructor() 
	{
		this.grid = GameManager.instance.grid;
	}

	ngOnInit() 
	{
		this.hex = this.data.origin;
		this._behavior = this.data.behavior;
		this._entity = this.data.entity;
		this.renderValidCells(this.hex);
	}

	private renderValidCells(origin: Hex<Cell>): void
	{
		this._validCells = this.grid.getWalkableHexes(origin);
		this.grid.renderValidCells(origin, this._validCells);
	}

	private clearValidCells(): void
	{
		this._validCells = null;
		this.grid.clearValidCells();
	}

	backToPreviousMenu(): void
	{
		GameManager.instance.windowManager.goToPreviousWindow();
	}
	  
	beforeCloseWindow(n: number): void
	{
		this.clearValidCells();
		this.grid.clearSelectedCells();
		if (n !== 0)
		{
			this.grid.renderSelectedCellsOutline([this.hex]);
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
		this.hexSubscription = GameManager.instance.subscribeToClickEvent((hex: Hex<Cell>) =>
		{
			if (this._validCells.indexOf(hex) > -1)
			{
				this.hexSubscription.unsubscribe();
				GameManager.instance.windowManager.closeAllWindows();
				GameManager.instance.createTurnCommand(this.hex, hex, this._entity, this._behavior);
			}
		});
	}
}

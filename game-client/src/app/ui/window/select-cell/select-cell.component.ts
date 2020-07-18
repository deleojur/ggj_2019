import { Component, OnInit } from '@angular/core';
import { GameManager } from 'src/app/game/game-manager';
import { Hex } from 'honeycomb-grid';
import { Cell } from 'src/app/game/grid/grid';
import { InnerWindowComponent } from '../window.component';
import { Subscription } from 'rxjs';
import { BehaviorInformation, Entity } from 'src/app/game/entities/entity';
import { ClientStateHandler } from 'src/app/game/states/client-states/client-state-handler';
import { GridClient } from 'src/app/game/grid/client-grid';
import { RenderType } from 'src/app/game/grid/grid-strategy';

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
	gridClient: GridClient;

	constructor(private clientStateHandler: ClientStateHandler)
	{
		this.gridClient = GameManager.instance.gridStrategy as GridClient;
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
		this._validCells = this.gridClient.renderValidCells(origin, this._behavior.type);
	}

	private clearValidCells(): void
	{
		this._validCells = null;
		this.gridClient.clearValidCells();
	}

	backToPreviousMenu(): void
	{
		GameManager.instance.windowManager.goToPreviousWindow();
	}
	  
	beforeCloseWindow(n: number): void
	{
		this.hexSubscription.unsubscribe();
		this.clearValidCells();
		this.gridClient.clearSelectedCells();
		if (n !== 0)
		{
			this.gridClient.renderSelectedCellsOutline([this.hex], this.clientStateHandler.getColor(), RenderType.StraightLine);
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
				GameManager.instance.createTurnCommand(this.hex, hex, this._entity, this._behavior);
				GameManager.instance.windowManager.closeAllWindows();
			}
		});
	}
}

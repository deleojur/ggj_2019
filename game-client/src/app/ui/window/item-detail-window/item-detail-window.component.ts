import { Component, OnInit, Input } from '@angular/core';
import { WindowType } from 'src/app/ui/window/window-manager';
import { ResourceManager } from 'src/app/game/components/resourceManager';
import { Hex } from 'honeycomb-grid';
import { Cell } from 'src/app/game/grid/grid';
import { BehaviorInformation, Entity } from 'src/app/game/entities/entity';
import { InnerWindowComponent } from '../window.component';
import { GameManager } from 'src/app/game/game-manager';

@Component({
  selector: 'app-item-detail-window',
  templateUrl: './item-detail-window.component.html',
  styleUrls: ['../window.component.scss', './item-detail-window.component.scss', '../item-overview-window/item-overview-window.component.scss']
})
export class ItemDetailWindowComponent implements OnInit, InnerWindowComponent
{
	@Input() data: any;
	width: string = '45vh'
	top: string = '-50px';

	menuItem: BehaviorInformation;
	private origin: Hex<Cell>;
	private entity: Entity;

	constructor() { }

	ngOnInit() 
	{
		this.origin = this.data.origin;
		this.menuItem = this.data.item;
		this.entity = this.data.entity;
	}

	buyItem()
	{
		GameManager.instance.resourceManager.tryAcquireItem(this.menuItem, this.origin, this.entity);
	}

	goToPreviousWindow(): void
	{
		GameManager.instance.windowManager.goToPreviousWindow();
	}

	beforeCloseWindow(n: number): void
	{
		if (n == 0)
		{
			GameManager.instance.clientGrid.clearSelectedCells();
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
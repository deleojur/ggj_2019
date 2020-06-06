import { Component, OnInit } from '@angular/core';
import { Hex } from 'honeycomb-grid';
import { Cell } from 'src/app/game/grid/grid';
import { BehaviorInformation } from 'src/app/game/entities/entity';
import { GameManager } from 'src/app/game/game-manager';
import { InnerWindowComponent } from '../window.component';
import { TurnInformation } from 'src/app/game/turns/turn-command';
import { WindowType } from '../window-manager';

@Component({
  selector: 'app-item-window',
  templateUrl: './item-overview-window.component.html',
  styleUrls: ['./item-overview-window.component.scss', '../window.component.scss']
})
export class ItemOverviewWindowComponent implements OnInit, InnerWindowComponent
{
	currentBehavior: BehaviorInformation = null;
	merchandise: BehaviorInformation[];
	data: any;
	origin: Hex<Cell>;
	width: string = '45vh';
	top: string = '-50px';

  	constructor()
	{
		
	}

	ngOnInit() 
	{
		this.origin = this.data.origin;
		this.merchandise = this.origin.entity.behaviors;

		const turnInformation: TurnInformation = GameManager.instance.turnSystem.getTurnInformation(this.origin);
		if (turnInformation !== null)
		{
			this.currentBehavior = turnInformation.behaviorInformation;
		}		
	}

	displayDetailsPage(menuItem: BehaviorInformation)
	{
		GameManager.instance.windowManager.openWindow(WindowType.ItemDetail, { name: menuItem.name, data: { origin: this.origin, item: menuItem } });
	}

	cancelItem(menuItem: BehaviorInformation): void
	{
		GameManager.instance.windowManager.closeAllWindows();
		GameManager.instance.unpurchaseItem(this.origin);
	}

	buyItem(menuItem: BehaviorInformation): void
	{
		console.log('buy that shit');
		GameManager.instance.resourceManager.tryPurchaseItem(menuItem, this.origin);
	}

	beforeCloseWindow(n: number): void
	{
		if (n == 0)
		{
			GameManager.instance.grid.clearSelectedCells();
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

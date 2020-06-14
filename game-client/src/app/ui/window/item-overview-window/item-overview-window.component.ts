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
		console.log(this.data);
		this.origin = this.data.origin;
		this.merchandise = this.origin.entity.behaviors;

		const turnInformation: BehaviorInformation[] = GameManager.instance.turnSystem.getBehaviorInformation(this.origin);
		if (turnInformation.length)
		{
			this.merchandise = turnInformation;
			this.setBehaviorInformation('assets/UI/button/r_skull.PNG', this.displayDetailsPage.bind(this), this.cancelItem.bind(this));
		} else
		{ 
			this.merchandise = this.origin.entity.behaviors;
			this.setBehaviorInformation('assets/UI/button/r_scroll.PNG', this.buyItem.bind(this), this.displayDetailsPage.bind(this));
		}
	}

	setBehaviorInformation(
		secondaryActionImgUrl: string, 
		onClickPrimary: (behavior: BehaviorInformation) => void,
		onClickSecondary: (behavior: BehaviorInformation) => void): void
	{		
		this.merchandise.forEach(e =>
		{
			e.secondaryActionImgUrl = secondaryActionImgUrl;
			e.onClickPrimary = onClickPrimary;
			e.onClickSecondary = onClickSecondary;
		});
	}

	displayDetailsPage(behaviorInformation: BehaviorInformation)
	{
		GameManager.instance.windowManager.openWindow(WindowType.ItemDetail, { name: behaviorInformation.name, data: { origin: this.origin, item: behaviorInformation } });
	}

	cancelItem(behaviorInformation: BehaviorInformation): void
	{
		GameManager.instance.windowManager.closeAllWindows();
		//GameManager.instance.unpurchaseItem(this.origin, );
	}

	buyItem(menuItem: BehaviorInformation): void
	{
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

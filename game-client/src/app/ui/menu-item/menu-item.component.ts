import { Component, OnInit, Input } from '@angular/core';
import { WindowType } from 'src/app/ui/window/window-manager';
import { Hex } from 'honeycomb-grid';
import { Cell } from 'src/app/game/grid/grid';
import { BehaviorInformation } from 'src/app/game/entities/entity';
import { GameManager } from 'src/app/game/game-manager';

@Component({
  selector: 'app-menu-item',
  templateUrl: './menu-item.component.html',
  styleUrls: ['./menu-item.component.scss']
})
export class MenuItemComponent implements OnInit
{
	@Input()
	public menuItem: BehaviorInformation;

	@Input()
	public origin: Hex<Cell>;

	constructor() { }

    ngOnInit() 
    {
		
	}
	
	displayDetailsPage()
	{
		GameManager.instance.windowManager.openWindow(WindowType.ItemDetail, { name: this.menuItem.name, data: { origin: this.origin, item: this.menuItem } });
	}

	buyItem()
	{
		GameManager.instance.resourceManager.tryPurchaseItem(this.menuItem, this.origin);
	}
}
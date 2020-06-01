import { Component, OnInit, Input } from '@angular/core';
import { WindowService, WindowType } from 'src/services/window.service';
import { ResourcesService } from 'src/services/resources.service';
import { Hex } from 'honeycomb-grid';
import { Cell } from 'src/app/game/grid/grid';
import { EntityInformation, BehaviorInformation } from 'src/app/game/entities/entity';

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

	constructor(private windowService: WindowService, private resourcesService: ResourcesService) { }

    ngOnInit() 
    {
		
	}
	
	displayDetailsPage()
	{
		this.windowService.openWindow(WindowType.ItemDetail, { name: this.menuItem.name, data: { origin: this.origin, item: this.menuItem } });
	}

	buyItem()
	{
		this.resourcesService.tryPurchaseItem(this.menuItem, this.origin);
	}
}
import { Component, OnInit, Input } from '@angular/core';
import { WindowService, WindowType } from 'src/services/window.service';
import { ResourcesService } from 'src/services/resources.service';
import { Hex } from 'honeycomb-grid';
import { Cell } from 'src/app/game/grid/grid';
import { EntityPrototype } from 'src/app/game/entities/entity';

@Component({
  selector: 'app-menu-item',
  templateUrl: './menu-item.component.html',
  styleUrls: ['./menu-item.component.scss']
})
export class MenuItemComponent implements OnInit
{
	@Input()
	public menuItem: EntityPrototype;

	@Input()
	public origin: Hex<Cell>;

	constructor(private windowService: WindowService, private resourcesService: ResourcesService) { }

    ngOnInit() 
    {
		
	}
	
	displayDetailsPage()
	{
		this.windowService.closeWindow(() =>
		{
			return this.windowService.openWindow(WindowType.ItemDetail, { name: this.menuItem.name, data: { origin: this.origin, item: this.menuItem } });
		});
	}

	buyItem()
	{
		if (this.resourcesService.areResourcesConditionsMet(this.menuItem.cost))
		{
			this.windowService.closeWindow(() =>
			{
				this.resourcesService.tryPurchaseItem(this.origin, this.menuItem);
			});
		}
	}
}
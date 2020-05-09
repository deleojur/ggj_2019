import { Component, OnInit, Input } from '@angular/core';
import { BuyableItemModel } from './buyableItem-model';
import { WindowService, WindowType } from 'src/services/window.service';
import { ResourcesService } from 'src/services/resources.service';

@Component({
  selector: 'app-menu-item',
  templateUrl: './menu-item.component.html',
  styleUrls: ['./menu-item.component.scss']
})
export class MenuItemComponent implements OnInit
{
	@Input()
	public menuItem: BuyableItemModel;

	constructor(private windowService: WindowService, private resourcesService: ResourcesService) { }

    ngOnInit() 
    {
		
	}
	
	displayDetailsPage()
	{
		this.windowService.closeWindow(() =>
		{
			return this.windowService.openWindow(WindowType.ItemDetail, { name: this.menuItem.$name, data: this.menuItem });
		});
	}

	buyItem()
	{
		if (this.resourcesService.areResourcesConditionsMet(this.menuItem.$cost))
		{
			this.windowService.closeWindow(() =>
			{
				this.resourcesService.tryPurchaseItem(this.menuItem);
			});
		}
	}
}
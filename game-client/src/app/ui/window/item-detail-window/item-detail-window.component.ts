import { Component, OnInit, Input } from '@angular/core';
import { WindowService, WindowType } from 'src/services/window.service';
import { ResourcesService } from 'src/services/resources.service';
import { BuyableItemModel } from '../../menu-item/buyableItem-model';

@Component({
  selector: 'app-item-detail-window',
  templateUrl: './item-detail-window.component.html',
  styleUrls: ['../window.component.scss', './item-detail-window.component.scss']
})
export class ItemDetailWindowComponent implements OnInit
{
	@Input() data: any;

	constructor(private windowService: WindowService, private resourcesService: ResourcesService) { }

	ngOnInit() 
	{
	}

	returnToItemOverviewWindow()
	{
		this.windowService.closeWindow(() =>
		{
			return this.windowService.openWindow(WindowType.ItemOverview, { name:"Buy" });
		});
	}

	buyItem()
	{
		const item: BuyableItemModel = this.data as BuyableItemModel;
		if (this.resourcesService.areResourcesConditionsMet(item.$cost))
		{
			this.windowService.closeWindow(() =>
			{
				this.resourcesService.tryPurchaseItem(item);
			});
		}
	}
}
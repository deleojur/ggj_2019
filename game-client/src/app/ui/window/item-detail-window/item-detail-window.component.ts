import { Component, OnInit, Input } from '@angular/core';
import { WindowService, WindowType } from 'src/services/window.service';
import { ResourcesService } from 'src/services/resources.service';
import { BuyableItemModel } from '../../menu-item/buyableItem-model';
import { Hex } from 'honeycomb-grid';
import { Cell } from 'src/app/game/grid/grid';

@Component({
  selector: 'app-item-detail-window',
  templateUrl: './item-detail-window.component.html',
  styleUrls: ['../window.component.scss', './item-detail-window.component.scss']
})
export class ItemDetailWindowComponent implements OnInit
{
	@Input() data: any;

	item: BuyableItemModel;
	private origin: Hex<Cell>;

	constructor(private windowService: WindowService, private resourcesService: ResourcesService) { }

	ngOnInit() 
	{
		this.origin = this.data.origin;
		this.item = this.data.item;
	}

	returnToItemOverviewWindow()
	{
		this.windowService.closeWindow(() =>
		{
			return this.windowService.openWindow(WindowType.ItemOverview, { name: "Buy" });
		});
	}

	buyItem()
	{
		if (this.resourcesService.areResourcesConditionsMet(this.item.$cost))
		{
			this.windowService.closeWindow(() =>
			{
				this.resourcesService.tryPurchaseItem(this.origin, this.item);
			});
		}
	}
}
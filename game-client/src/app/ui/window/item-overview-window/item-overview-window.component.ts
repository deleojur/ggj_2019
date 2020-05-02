import { BuyableItemModel} from 'src/app/ui/menu-item/buyableItem-model';
import { Component, OnInit, Injector } from '@angular/core';
import { merchandiseService } from 'src/services/merchandise.service';
import { WindowService, WindowType, WindowItem } from 'src/services/window.service';
import { GameService } from 'src/services/game.service';

@Component({
  selector: 'app-item-window',
  templateUrl: './item-overview-window.component.html',
  styleUrls: ['./item-overview-window.component.scss', '../window.component.scss']
})
export class ItemOverviewWindowComponent implements OnInit
{
	merchandise: BuyableItemModel[];

  	constructor(
		private merchandiseService: merchandiseService,
		private windowService: WindowService)
	{
	}

	ngOnInit() 
	{
		this.merchandise = this.merchandiseService.getPlaceholderItems();
	}
}

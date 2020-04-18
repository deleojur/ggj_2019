import { BuyableItemModel} from 'src/app/ui/menu-item/buyableItem-model';
import { Component, OnInit, Injector } from '@angular/core';
import { merchandiseService } from 'src/services/merchandise.service';
import { WindowService, WindowType, WindowItem } from 'src/services/window.service';
import { GameService } from 'src/services/game.service';

@Component({
  selector: 'app-item-window',
  templateUrl: './item-overview-window.component.html',
  styleUrls: ['./item-overview-window.component.scss']
})
export class ItemOverviewWindowComponent implements OnInit
{
	merchandise: string[] = ['town', 'village'];

  	constructor(
		private merchandiseService: merchandiseService,
		private windowService: WindowService)
	{
	}

	ngOnInit() 
	{
		
	}
	  
	clickItem(item: string)
	{
		const merchandise: BuyableItemModel = this.merchandiseService.merchandise(item);
		this.windowService.closeWindow();
	}
}

import { Component, OnInit, Input } from '@angular/core';
import { WindowService, WindowType } from 'src/services/window.service';

@Component({
  selector: 'app-item-detail-window',
  templateUrl: './item-detail-window.component.html',
  styleUrls: ['../window.component.scss', './item-detail-window.component.scss']
})
export class ItemDetailWindowComponent implements OnInit
{
	@Input() data: any;

	constructor(private windowService: WindowService) { }

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

	closeItemDetailWindow()
	{
		this.windowService.closeWindow();
	}
}
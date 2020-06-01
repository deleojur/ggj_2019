import { Component, OnInit, Input } from '@angular/core';
import { WindowService, WindowType } from 'src/services/window.service';
import { ResourcesService } from 'src/services/resources.service';
import { Hex } from 'honeycomb-grid';
import { Cell } from 'src/app/game/grid/grid';
import { BehaviorInformation } from 'src/app/game/entities/entity';
import { InnerWindowComponent } from '../window.component';
import { GameManager } from 'src/app/game/game-manager';

@Component({
  selector: 'app-item-detail-window',
  templateUrl: './item-detail-window.component.html',
  styleUrls: ['../window.component.scss', './item-detail-window.component.scss']
})
export class ItemDetailWindowComponent implements OnInit, InnerWindowComponent
{
	@Input() data: any;
	width: string = '45vh'
	top: string = '-50px';

	menuItem: BehaviorInformation;
	private origin: Hex<Cell>;

	constructor(public windowService: WindowService, private resourcesService: ResourcesService) { }

	ngOnInit() 
	{
		this.origin = this.data.origin;
		this.menuItem = this.data.item;
	}

	buyItem()
	{
		this.resourcesService.tryPurchaseItem(this.menuItem, this.origin);
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
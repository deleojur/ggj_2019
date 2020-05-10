import { Component, OnInit, Injector } from '@angular/core';
import { GameService } from 'src/services/game.service';
import { Hex } from 'honeycomb-grid';
import { Cell } from 'src/app/game/grid/grid';
import { EntityPrototype } from 'src/app/game/entities/entity';

@Component({
  selector: 'app-item-window',
  templateUrl: './item-overview-window.component.html',
  styleUrls: ['./item-overview-window.component.scss', '../window.component.scss']
})
export class ItemOverviewWindowComponent implements OnInit
{
	merchandise: EntityPrototype[];
	data: any;
	origin: Hex<Cell>;

  	constructor(private gameService: GameService)
	{
		
	}

	ngOnInit() 
	{
		this.origin = this.data.origin;
		this.merchandise = this.gameService.getBuyableItems(this.origin);
	}
}

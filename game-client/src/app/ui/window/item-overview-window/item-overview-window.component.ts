import { Component, OnInit, Injector } from '@angular/core';
import { Hex } from 'honeycomb-grid';
import { Cell } from 'src/app/game/grid/grid';
import { BehaviorInformation } from 'src/app/game/entities/entity';
import { GameManager } from 'src/app/game/game-manager';

@Component({
  selector: 'app-item-window',
  templateUrl: './item-overview-window.component.html',
  styleUrls: ['./item-overview-window.component.scss', '../window.component.scss']
})
export class ItemOverviewWindowComponent implements OnInit
{
	merchandise: BehaviorInformation[];
	data: any;
	origin: Hex<Cell>;

  	constructor()
	{
		
	}

	ngOnInit() 
	{
		this.origin = this.data.origin;
		this.merchandise = this.origin.entity.behaviors;
	}
}

import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { WindowType } from 'src/app/ui/window/window-manager';
import { Hex } from 'honeycomb-grid';
import { Cell } from 'src/app/game/grid/grid';
import { BehaviorInformation } from 'src/app/game/entities/entity';
import { GameManager } from 'src/app/game/game-manager';

@Component({
  selector: 'app-menu-item',
  templateUrl: './menu-item.component.html',
  styleUrls: ['./menu-item.component.scss']
})
export class MenuItemComponent implements OnInit
{
	@Output()
	public mainButtonPressed: EventEmitter<BehaviorInformation> = new EventEmitter<BehaviorInformation>();

	@Output()
	public secondaryButtonPressed: EventEmitter<BehaviorInformation> = new EventEmitter<BehaviorInformation>(); 

	@Input()
	public menuItem: BehaviorInformation;

	@Input()
	public origin: Hex<Cell>;

	@Input()
	public secondaryActionImgURL: string;

	constructor() { }

    ngOnInit() 
    {
		
	}

	clickMainButton()
	{
		this.mainButtonPressed.emit(this.menuItem);
	}

	clickSecondaryButton()
	{
		this.secondaryButtonPressed.emit(this.menuItem);
	}
}
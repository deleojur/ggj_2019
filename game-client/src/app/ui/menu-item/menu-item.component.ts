import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Hex } from 'honeycomb-grid';
import { Cell } from 'src/app/game/grid/grid';
import { BehaviorInformation, Entity } from 'src/app/game/entities/entity';

export interface ButtonEvent
{
	behavior: BehaviorInformation;
	entity: Entity;
};

@Component({
  selector: 'app-menu-item',
  templateUrl: './menu-item.component.html',
  styleUrls: ['./menu-item.component.scss']
})
export class MenuItemComponent implements OnInit
{
	@Output()
	public mainButtonPressed: EventEmitter<ButtonEvent> = new EventEmitter<ButtonEvent>();

	@Output()
	public secondaryButtonPressed: EventEmitter<ButtonEvent> = new EventEmitter<ButtonEvent>(); 

	@Input()
	public menuItem: BehaviorInformation;

	@Input()
	public origin: Hex<Cell>;

	@Input()
	public entity: Entity;

	@Input()
	public secondaryActionImgURL: string;

	constructor() { }

    ngOnInit() 
    {
	
	}

	clickMainButton()
	{
		this.mainButtonPressed.emit({ behavior: this.menuItem, entity: this.entity });
	}

	clickSecondaryButton()
	{
		this.secondaryButtonPressed.emit({ behavior: this.menuItem, entity: this.entity });
	}
}
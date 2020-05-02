import { Component, OnInit, Input } from '@angular/core';
import { Resource, ResourceType } from '../menu-item/buyableItem-model';

@Component
({
	selector: 'app-resource',
	templateUrl: './resource.component.html',
  	styleUrls: ['./resource.component.scss']
})
export class ResourceComponent implements OnInit
{
	@Input()
	resource: Resource;

	@Input()
	upkeep: boolean = false;

	get amountAsText(): string
	{
		let amountAsText: string = this.resource.$amount.toString();
		if (this.upkeep && this.resource.$amount > 0)
		{
			amountAsText = '+' + amountAsText;
		}
		return amountAsText;
	}

	get showAmountAsPlural() : boolean
	{
		return false;// this.resource.$amount < 4;
	}

	get amountAsArray() : Array<number>
	{
		return Array<number>(this.resource.$amount).fill(0);
	}

	ngOnInit()
	{
  	}
}
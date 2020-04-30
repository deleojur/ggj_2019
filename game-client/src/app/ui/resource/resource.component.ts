import { Component, OnInit, Input } from '@angular/core';
import { resource, ResourceType } from '../menu-item/buyableItem-model';

@Component
({
	selector: 'app-resource',
	templateUrl: './resource.component.html',
  	styleUrls: ['./resource.component.scss']
})
export class ResourceComponent implements OnInit
{
	@Input()
	resource: resource;

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
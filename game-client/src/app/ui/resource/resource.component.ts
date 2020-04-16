import { Component, OnInit } from '@angular/core';
import { resource, ResourceType } from '../menu-item/buyableItem-model';

@Component
({
	selector: 'app-resource',
	templateUrl: './resource.component.html',
  	styleUrls: ['./resource.component.scss']
})
export class ResourceComponent implements OnInit
{
	resource: resource;

	ngOnInit()
	{
		this.resource = new resource(ResourceType.Gold, 3);
  	}
}
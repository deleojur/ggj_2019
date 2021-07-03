import { Component, Input, OnInit } from '@angular/core';
import { HTMLElementSize } from 'src/app/enums';
import { Resource } from 'src/app/game/entities/resource';

@Component({
  selector: 'app-resource-hud',
  templateUrl: './resource-hud.component.html',
  styleUrls: ['./resource-hud.component.scss']
})
export class ResourceHudComponent implements OnInit
{
	@Input() drawRight: boolean;
	@Input() resource: Resource;
	@Input() textSize: HTMLElementSize = HTMLElementSize.Small;

	constructor() 
	{

	}
	
	ngOnInit() 
	{
		
	}
}
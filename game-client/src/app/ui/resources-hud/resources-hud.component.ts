import { Component, OnInit } from '@angular/core';
import { ResourcesService } from 'src/services/resources.service';

@Component({
  selector: 'app-resources-hud',
  templateUrl: './resources-hud.component.html',
  styleUrls: ['./resources-hud.component.scss']
})
export class ResourcesHudComponent implements OnInit
{
	constructor(public resourcesService: ResourcesService)
	{
		
	}

	ngOnInit() 
	{
	}
}
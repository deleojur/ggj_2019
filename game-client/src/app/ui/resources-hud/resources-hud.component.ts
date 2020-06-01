import { Component, OnInit } from '@angular/core';
import { Resource } from 'src/app/game/entities/resource';
import { GameManager } from 'src/app/game/game-manager';

@Component({
  selector: 'app-resources-hud',
  templateUrl: './resources-hud.component.html',
  styleUrls: ['./resources-hud.component.scss']
})
export class ResourcesHudComponent implements OnInit
{
	resourcePool: Resource[];
	constructor()
	{
		
	}

	ngOnInit() 
	{
		this.resourcePool = GameManager.instance.resourceManager.$resourcePool;
	}
}
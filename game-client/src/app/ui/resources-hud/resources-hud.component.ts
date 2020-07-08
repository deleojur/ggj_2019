import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Resource } from 'src/app/game/entities/resource';
import { GameManager } from 'src/app/game/game-manager';

@Component({
  selector: 'app-resources-hud',
  templateUrl: './resources-hud.component.html',
  styleUrls: ['./resources-hud.component.scss']
})
export class ResourcesHudComponent implements OnInit
{
	showCheckbox: boolean = false;

	resourcePool: Resource[];
	constructor()
	{
		
	}

	ngOnInit() 
	{
		this.resourcePool = GameManager.instance.resourceManager.$resourcePool;
	}

	ngAfterViewInit()
    {
	}

	onConfirmButtonClicked(): void
	{
		this.showCheckbox = !this.showCheckbox;

		if (this.showCheckbox)
		{
			console.log('I\'m ready!');
		} else 
		{
			console.log('I\'m not ready');
		}
	}
}
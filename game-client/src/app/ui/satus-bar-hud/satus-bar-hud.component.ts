import { Component, OnInit } from '@angular/core';
import { Resource } from 'src/app/game/entities/resource';
import { GameManager } from 'src/app/game/game-manager';

@Component({
  selector: 'app-satus-bar-hud',
  templateUrl: './satus-bar-hud.component.html',
  styleUrls: ['./satus-bar-hud.component.scss']
})
export class StatusBarHudComponent implements OnInit
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
			
		} else 
		{
			console.log('I\'m not ready');
		}
	}
}
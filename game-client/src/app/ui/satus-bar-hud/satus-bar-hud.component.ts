import { Component, OnInit } from '@angular/core';
import { Resource } from 'src/app/game/entities/resource';
import { GameManager } from 'src/app/game/game-manager';
import { WindowType } from '../window/window-manager';

@Component({
  selector: 'app-satus-bar-hud',
  templateUrl: './satus-bar-hud.component.html',
  styleUrls: ['./satus-bar-hud.component.scss', '../game-hud.scss']
})
export class StatusBarHudComponent implements OnInit
{	
	resourcePool: Resource[];
	
	constructor()
	{
		
	}

	ngOnInit() 
	{
		this.resourcePool = GameManager.instance.resourceManager.resourcePool;
	}

	ngAfterViewInit()
    {
	}

	onMenuButtonClicked(): void
	{
		GameManager.instance.windowManager.openWindow(WindowType.MoreOptions, { name: "Blaat", data: { option1: "blaat" } });
		//GameManager.instance.clientTurnSystem.sendSubmitTurn(this.showCheckbox);
	}
}
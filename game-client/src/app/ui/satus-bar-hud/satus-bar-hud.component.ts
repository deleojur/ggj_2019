import { Component, OnInit } from '@angular/core';
import { Resource } from 'src/app/game/entities/resource';
import { GameManager } from 'src/app/game/game-manager';

@Component({
  selector: 'app-satus-bar-hud',
  templateUrl: './satus-bar-hud.component.html',
  styleUrls: ['./satus-bar-hud.component.scss', '../game-hud.scss']
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
		this.resourcePool = GameManager.instance.resourceManager.resourcePool;
	}

	ngAfterViewInit()
    {
	}

	onConfirmButtonClicked(): void
	{
		this.showCheckbox = !this.showCheckbox;
		GameManager.instance.clientTurnSystem.sendSubmitTurn(this.showCheckbox);
	}
}
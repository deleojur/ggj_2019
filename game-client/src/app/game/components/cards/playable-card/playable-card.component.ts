import { Component, Input, OnInit } from '@angular/core';
import { Card } from 'src/app/game/entities/card';
import { Resource } from 'src/app/game/entities/resource';
import { GameManager } from 'src/app/game/game-manager';
import { ResourceManager } from '../../resourceManager';

@Component({
  selector: 'app-playable-card',
  templateUrl: './playable-card.component.html',
  styleUrls: ['./playable-card.component.scss']
})
export class PlayableCardComponent implements OnInit 
{
	@Input() card: Card;

	resources: Resource[] = [];
	
	constructor()
	{
		this.resources = GameManager.instance.resourceManager.resourcePool.splice(2, 3);
	}

	ngOnInit()
	{
		
  	}
}
import { Component, OnInit } from '@angular/core';
import { AssetLoader } from 'src/app/asset-loader';
import { Card } from 'src/app/game/cards/card';
import { GameManager } from 'src/app/game/game-manager';

@Component({
  selector: 'app-card-container',
  templateUrl: './card-container.component.html',
  styleUrls: ['./card-container.component.scss']
})
export class CardContainerComponent implements OnInit 
{
	cards: Card[];
	blaat: number = 8;

	constructor()
	{		
		AssetLoader.instance.loadAssetsAsync().then(() => 
		{
			this.cards = AssetLoader.instance.cards;
			console.log(this.cards);
		});
	}

	ngOnInit() 
	{
	}
}
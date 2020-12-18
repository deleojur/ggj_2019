import { Component, OnInit } from '@angular/core';
import { AssetLoader } from 'src/app/asset-loader';
import { Card } from 'src/app/game/entities/card';

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
			this.cards = AssetLoader.instance.getCardsByName(['Lay siege', 'Spy']);
			console.log(this.cards);
		});
	}

	ngOnInit() 
	{
	}
}
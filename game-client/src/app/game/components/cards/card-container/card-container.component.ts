import { Component, OnInit } from '@angular/core';
import { Card, CardTier } from 'src/app/game/entities/card';
import { Resource } from 'src/app/game/entities/resource';
import { PlayableCardComponent } from '../playable-card/playable-card.component';

@Component({
  selector: 'app-card-container',
  templateUrl: './card-container.component.html',
  styleUrls: ['./card-container.component.scss']
})
export class CardContainerComponent implements OnInit 
{
	cards: Card[] = [new Card('assets/cards/background/red.png', 'assets/cards/abilities/sword.png', 'Attack', 
	[ 
		new CardTier('Swordfighting', 'Fight by sword', 
		[
			new Resource('Food', 2),
			new Resource('Gold', 1)
		])
	], 'Lionheart')];

	blaat: number = 8;

	constructor()
	{

	}

	ngOnInit() 
	{
	}
}
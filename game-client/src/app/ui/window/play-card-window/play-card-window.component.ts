import { Component, OnInit } from '@angular/core';
import { Card } from 'src/app/game/cards/card';
import { CardService } from 'src/app/game/components/cards/card.service';
import { InnerWindowComponent } from '../window.component';

@Component({
  selector: 'app-play-card-window',
  templateUrl: './play-card-window.component.html',
  styleUrls: ['../window.component.scss', './play-card-window.component.scss']
})
export class PlayCardWindowComponent implements OnInit, InnerWindowComponent
{
	closeWindowButton: boolean = true;
	cards: Card[];
	data: any;

	beforeCloseWindow(n: number): void
	{
		
	}

	beforeOpenWindow(n: number): void
	{
		this.cards =  this.data as Card[];
	}

	afterCloseWindow(n: number): void
	{

	}

	afterOpenWindow(n: number): void
	{

	}

	onCardOutlineSelected(card: Card): void
	{
		this.cardService.inspectCard(card);
	}
	
	constructor(private cardService: CardService) 
	{
		
	}

	ngOnInit()
	{

	}
}
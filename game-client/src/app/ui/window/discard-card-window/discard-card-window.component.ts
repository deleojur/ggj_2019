import { Component, OnInit } from '@angular/core';
import { Card } from 'src/app/game/cards/card';
import { CardService } from 'src/app/game/components/cards/card.service';
import { InnerWindowComponent } from '../window.component';

@Component({
  selector: 'app-discard-card-window',
  templateUrl: './discard-card-window.component.html',
  styleUrls: ['./discard-card-window.component.scss']
})
export class DiscardCardWindowComponent implements OnInit, InnerWindowComponent
{
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
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Component, OnInit } from '@angular/core';
import { Card } from 'src/app/game/cards/card';
import { CardService } from 'src/app/game/components/cards/card.service';
import { CardOutlineAnimation } from 'src/app/game/components/cards/outline-card/outline-card.component';
import { CardAnimation as CardAnimation } from 'src/app/game/components/cards/playable-card/playable-card.component';
import { InnerWindowComponent } from '../window.component';

@Component({
  selector: 'app-draft-cards-window',
  templateUrl: './draft-cards-window.component.html',
  styleUrls: ['../window.component.scss', './draft-cards-window.component.scss']
})
export class DraftCardsWindowComponent implements OnInit, InnerWindowComponent
{
	cards: Card[];
	data: any;
	
	cardOutlineAnimation: CardOutlineAnimation = CardOutlineAnimation.None;

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

	updateWindowData(data: any): void
	{
		console.log('update data', data);
	}
	
	constructor(private cardService: CardService) 
	{
		
	}

	ngOnInit()
	{
		// setTimeout(() => {
		// 	this.cardOutlineAnimation = CardOutlineAnimation.AnimateInSize;
		// }, 1200);
	}
}

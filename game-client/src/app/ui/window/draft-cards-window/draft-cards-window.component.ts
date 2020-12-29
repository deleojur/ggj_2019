import { Component, OnInit } from '@angular/core';
import { Card } from 'src/app/game/cards/card';
import { DraftDirection } from 'src/app/game/cards/card-manager';
import { CardService } from 'src/app/game/components/cards/card.service';
import { CardOutlineAnimation } from 'src/app/game/components/cards/outline-card/outline-card.component';
import { GameManager } from 'src/app/game/game-manager';
import { ClientData, DraftData } from 'src/app/game/states/request-data';
import { InnerWindowComponent } from '../window.component';

@Component({
  selector: 'app-draft-cards-window',
  templateUrl: './draft-cards-window.component.html',
  styleUrls: ['../window.component.scss', './draft-cards-window.component.scss']
})
export class DraftCardsWindowComponent implements OnInit, InnerWindowComponent
{	
	cards: Card[];
	pickedCard: Card;
	direction: DraftDirection;
	passto: ClientData;
	getfrom: ClientData;
	data: any;
	animationsCompleted: number = 0;	
	
	cardOutlineAnimation: CardOutlineAnimation;

	beforeCloseWindow(n: number): void
	{
		
	}

	beforeOpenWindow(n: number): void
	{
		this.cards = this.data as Card[];				
	}

	get outlineAnimationIn(): CardOutlineAnimation
	{
		return this.direction === DraftDirection.Left ? CardOutlineAnimation.NeutralLeft : CardOutlineAnimation.NeutralRight;
	}

	get outlineAnimationOut(): CardOutlineAnimation
	{
		return this.direction === DraftDirection.Right ? CardOutlineAnimation.AnimateOutLeft : CardOutlineAnimation.AnimateOutRight;
	}

	get showWaitingForOtherPlayers(): boolean
	{		
		return this.cards && this.animationsCompleted === this.cards.length;
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

	onTransitionEnd(cardOutlineAnimation: CardOutlineAnimation): void
	{
		if (cardOutlineAnimation === CardOutlineAnimation.AnimateOutLeft || cardOutlineAnimation === CardOutlineAnimation.AnimateOutRight)		
		{		
			this.animationsCompleted++;

			if (this.showWaitingForOtherPlayers)
			{
				this.cardOutlineAnimation = this.outlineAnimationIn;
				GameManager.instance.clientCardManager.pickDraftCard(this.pickedCard.id);				
			}
		}
	}

	updateContent(data: any): void
	{
		this.cardOutlineAnimation = this.cardOutlineAnimation;
		this.cards = data.cards;
		this.pickedCard = undefined;
		this.direction = data.direction;
		this.passto = data.passto;
		this.getfrom = data.getfrom;
		this.animationsCompleted = 0;

		this.cardOutlineAnimation = this.outlineAnimationIn;
		setTimeout(() =>
		{
			this.cardService.animateOutlineCards(CardOutlineAnimation.AnimateInSize);
			this.cardService.resetPlayableCardAnimation();
		}, 0);
	}

	sendMessage(msg: string, data?: any): void
	{
		if (msg === 'UPDATE_CONTENT')
		{
			this.updateContent(data);
		} if (msg === 'CLEAR_CONTENT')
		{
			this.pickedCard = data;
			this.cardOutlineAnimation = CardOutlineAnimation.AnimateOutSize;
		}		
	}	

	constructor(private cardService: CardService) 
	{
		this.sendMessage = this.sendMessage.bind(this);
	}

	ngOnInit()
	{
		this.cardService.onInspectedCardPicked(card =>
		{
			this.pickedCard = card;
		});

		this.cardService.onInspectedCardAnimationCompleted(animation =>
		{
			this.cardOutlineAnimation = CardOutlineAnimation.AnimateOutSize;
		});
	}
}

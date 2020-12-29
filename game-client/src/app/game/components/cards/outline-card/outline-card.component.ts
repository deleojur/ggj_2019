import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Card } from 'src/app/game/cards/card';
import { CardService } from '../card.service';

export enum CardOutlineAnimation
{
	None = '',
	AnimateOutLeft = 'animate-out-left',
	AnimateOutRight = 'animate-out-right',
	AnimateOutSize = 'animate-out-size',
	AnimateInSize = 'animate-in-size',
	AnimateNormalSize = 'animate-normal-size',
	NeutralLeft = 'neutral-left',
	NeutralRight = 'neutral-right'
}

@Component({
  selector: 'app-outline-card',
  templateUrl: './outline-card.component.html',
  styleUrls: ['../playable-card/playable-card.component.scss', './outline-card.component.scss']
})
export class OutlineCardComponent implements OnInit
{
	@Input() card: Card;
	@Input() order: number;	
	@Input() cardOutlineAnimation;

	@Output() onTransitionEnd: EventEmitter<CardOutlineAnimation> = new EventEmitter<CardOutlineAnimation>();
	@Output() onOutlineClicked: EventEmitter<Card> = new EventEmitter<Card>();	

	@Input() animationIn;
	@Input() animationOut;

	constructor(private cardService: CardService) 
	{
		
	}

	ngOnInit() 
	{
		this.cardService.onOutlineCardsAnimate(cardOutlineAnimation => 
		{
			this.playAnimationDelayed(cardOutlineAnimation);
		});
	}

	private playAnimationDelayed(cardOutlineAnimation: CardOutlineAnimation): void
	{
		setTimeout(() =>
		{
			this.cardOutlineAnimation = cardOutlineAnimation;
		}, this.order * 100);
	}

	get animateInSize(): boolean
	{
		return this.cardOutlineAnimation === CardOutlineAnimation.AnimateInSize;
	}

	get animateOutSize(): boolean
	{
		return this.cardOutlineAnimation === CardOutlineAnimation.AnimateOutSize;
	}

	get animateNormalSize(): boolean
	{
		return this.cardOutlineAnimation === CardOutlineAnimation.AnimateNormalSize;
	}

	get animateOutLeft(): boolean
	{
		return this.cardOutlineAnimation === CardOutlineAnimation.AnimateOutLeft;
	}

	get animateOutRight(): boolean
	{
		return this.cardOutlineAnimation === CardOutlineAnimation.AnimateOutRight;
	}

	get neutralLeft(): boolean
	{
		return this.cardOutlineAnimation === CardOutlineAnimation.NeutralLeft;
	}

	get neutralRight(): boolean
	{
		return this.cardOutlineAnimation === CardOutlineAnimation.NeutralRight;
	}

	transitionEnd(e: Event): void
	{		
		if (this.cardOutlineAnimation === CardOutlineAnimation.AnimateInSize)
		{
			this.cardOutlineAnimation = CardOutlineAnimation.AnimateNormalSize;
		}
		if (this.cardOutlineAnimation === CardOutlineAnimation.AnimateOutSize)
		{
			this.playAnimationDelayed(this.animationOut);
		}
		this.onTransitionEnd.emit(this.cardOutlineAnimation);
	}
}

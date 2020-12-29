import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Card } from 'src/app/game/cards/card';

export enum CardOutlineAnimation
{
	None = '',
	AnimateOutLeft = 'animate-out-left',
	AnimateOutRight = 'animate-out-right',	
	AnimateInSize = 'animate-in-size'
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

	@Output() onOutlineClicked: EventEmitter<Card> = new EventEmitter<Card>();

	@Input() cardOutlineAnimation;

	@Output() onTransitionEnd: EventEmitter<null> = new EventEmitter<null>();

	constructor() 
	{
		
	}

	ngOnInit() 
	{
		console.log(this.order);
	}

	get animateInSize(): boolean
	{
		return this.cardOutlineAnimation === CardOutlineAnimation.AnimateInSize;
	}

	get animateOutLeft(): boolean
	{
		return this.cardOutlineAnimation === CardOutlineAnimation.AnimateOutLeft;
	}

	get animateOutRight(): boolean
	{
		return this.cardOutlineAnimation === CardOutlineAnimation.AnimateOutRight;
	}

	transitionEnd(e: Event): void
	{
		if (this.cardOutlineAnimation === CardOutlineAnimation.AnimateInSize)
		{
			setTimeout(() =>
			{
				this.cardOutlineAnimation = CardOutlineAnimation.AnimateOutLeft;
			}, this.order * 200);			
		}
	}
}

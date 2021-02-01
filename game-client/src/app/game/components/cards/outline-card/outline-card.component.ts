import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
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
export class OutlineCardComponent implements OnInit, AfterViewInit
{
	@Input() card: Card;
	@Input() order: number;	
	@Input() cardOutlineAnimation;

	@Output() onTransitionEnd: EventEmitter<CardOutlineAnimation> = new EventEmitter<CardOutlineAnimation>();
	@Output() onOutlineClicked: EventEmitter<Card> = new EventEmitter<Card>();	

	@Input() animationIn;
	@Input() animationOut;

	@ViewChild('cardTitle', {static: true}) cardTitleElement;

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
	
	ngAfterViewInit()
	{
		this.setTitleFontSize();
	}

	private setTitleFontSize(): void
	{
		const maxFontSize: number = parseInt(getComputedStyle(this.cardTitleElement.nativeElement).fontSize.match(/\d+/)[0]);
		const textLength: number = this.card.title.length;
		const step: number = Math.max(textLength - 15, 0);
		const targetFontSize: number = maxFontSize - step;
		this.cardTitleElement.nativeElement.style.setProperty('font-size', `${targetFontSize}px`);
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

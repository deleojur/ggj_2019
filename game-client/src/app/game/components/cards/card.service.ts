import { Injectable } from '@angular/core';
import { Card } from '../../cards/card';
import { Subject, Subscription } from 'rxjs';
import { PlayableCardAnimation as PlayableCardAnimation } from './playable-card/playable-card.component';
import { CardOutlineAnimation } from './outline-card/outline-card.component';

@Injectable
({
	providedIn: 'root'
})
export class CardService
{
	private _onInspectedCardpicked: Subject<Card>;	
	private _onInspectedCardUpdate: Subject<Card>;
	private _onInspectedCardAnimationCompleted: Subject<PlayableCardAnimation>;
	private _onOutlineCardsAnimate: Subject<CardOutlineAnimation>;
	private _onInspectedCardAnimate: Subject<PlayableCardAnimation>;
	private _onPlayableCardReset: Subject<null>;
	
	private _inspectedCard: Card;
	
	constructor() 
	{
		this._onInspectedCardUpdate = new Subject<Card>();
		this._onInspectedCardpicked = new Subject<Card>();
		this._onInspectedCardAnimationCompleted = new Subject<PlayableCardAnimation>();
		this._onOutlineCardsAnimate = new Subject<CardOutlineAnimation>();
		this._onInspectedCardAnimate = new Subject<PlayableCardAnimation>();
		this._onPlayableCardReset = new Subject<null>();
	}

	public onInspectedCardAnimationCompleted(f: (animation: PlayableCardAnimation) => void): Subscription
	{
		return this._onInspectedCardAnimationCompleted.subscribe(f);
	}

	public onInspectedCardUpdated(f: (card: Card) => void): Subscription
	{
		return this._onInspectedCardUpdate.subscribe(f);
	}

	public onInspectedCardPicked(f: (card: Card) => void): Subscription
	{
		return this._onInspectedCardpicked.subscribe(f);
	}

	public onOutlineCardsAnimate(f: (cardOutlineAnimation: CardOutlineAnimation) => void): Subscription
	{
		return this._onOutlineCardsAnimate.subscribe(f);
	}

	public onInspectedCardAnimate(f: (cardOutlineAnimation: PlayableCardAnimation) => void): Subscription
	{
		return this._onInspectedCardAnimate.subscribe(f);
	}

	public onResetPlayableCardAnimation(f: () => void): Subscription
	{
		return this._onPlayableCardReset.subscribe(f);
	}

	public pickCard(): void
	{
		this._onInspectedCardpicked.next(this.currentCard);
	}

	public inspectCard(card: Card): void
	{
		this._inspectedCard = card;
		this._onInspectedCardUpdate.next(card);		
	}

	public inspectedCardAnimtationCompleted(cardAnimation: PlayableCardAnimation): void
	{
		this._onInspectedCardAnimationCompleted.next(cardAnimation);
	}

	public animateOutlineCards(cardOutlineAnimation: CardOutlineAnimation): void
	{
		this._onOutlineCardsAnimate.next(cardOutlineAnimation);
	}

	public resetPlayableCardAnimation(): void
	{
		this._onPlayableCardReset.next();
	}

	public get currentCard(): Card
	{
		return this._inspectedCard;
	}

	public closeInspectedCard(): void
	{
		this._inspectedCard = undefined;
	}

	public animateInspectedCard(playableCardAnimation: PlayableCardAnimation): void
	{
		this._onInspectedCardAnimate.next(playableCardAnimation);
	}
}

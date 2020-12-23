import { Injectable } from '@angular/core';
import { Card } from '../../cards/card';
import { Subject, Subscription } from 'rxjs';

@Injectable
({
	providedIn: 'root'
})
export class CardService
{
	private _inspectedCard: Card;
	private _onInspectedCardUpdate: Subject<Card>;

	constructor() 
	{
		this._onInspectedCardUpdate = new Subject<Card>();
	}

	public onInspectedCardUpdated(f: (card: Card) => void): Subscription
	{
		return this._onInspectedCardUpdate.subscribe(f);
	}

	public inspectCard(card: Card): void
	{
		this._inspectedCard = card;
		this._onInspectedCardUpdate.next(card);		
	}

	public get inspectedCard(): Card
	{
		return this._inspectedCard;
	}

	public closeInspectedCard()
	{
		this._inspectedCard = undefined;
	}
}

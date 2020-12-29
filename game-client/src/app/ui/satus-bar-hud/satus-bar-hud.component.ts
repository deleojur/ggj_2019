import { Component, OnInit } from '@angular/core';
import { Card } from 'src/app/game/cards/card';
import { CardService } from 'src/app/game/components/cards/card.service';
import { CardAnimation } from 'src/app/game/components/cards/playable-card/playable-card.component';
import { Resource } from 'src/app/game/entities/resource';
import { GameManager } from 'src/app/game/game-manager';
import { WindowType } from '../window/window-manager';

@Component({
  selector: 'app-satus-bar-hud',
  templateUrl: './satus-bar-hud.component.html',
  styleUrls: ['./satus-bar-hud.component.scss', '../game-hud.scss']
})
export class StatusBarHudComponent implements OnInit
{	
	resourcePool: Resource[];
	cardAnimation: CardAnimation = CardAnimation.AnimateOut;
	
	constructor(private _cardService: CardService)
	{
		this._cardService.onInspectedCardUpdated((card: Card) =>
		{			
			setTimeout(() => { this.cardAnimation = CardAnimation.AnimateIn; }, 0); //itty bitty hack
		});

		this._cardService.onResetPlayableCardAnimation(() =>
		{
			this.cardAnimation = CardAnimation.AnimateOut;
		});
	}

	get inspectedCard(): Card
	{
		return this._cardService.currentCard;
	}

	ngOnInit() 
	{
		this.resourcePool = GameManager.instance.resourceManager.resourcePool;		
	}

	ngAfterViewInit()
    {
	}

	closeInspectedCard(): void
	{
		this.cardAnimation = CardAnimation.AnimateOut;
	}

	onCardCloseAnimationCompleted(): void
	{
		if (this.cardAnimation === CardAnimation.AnimateOut || this.cardAnimation === CardAnimation.AnimateToInventory)
		{
			this._cardService.closeInspectedCard();
		}
		if (this.cardAnimation === CardAnimation.AnimateToInventory)
		{			
			this._cardService.inspectedCardAnimtationCompleted(this.cardAnimation);
		}
	}

	openPlayCardWindow(): void
	{
		const gameManager: GameManager = GameManager.instance;
		gameManager.windowManager.openWindow(WindowType.PlayCards, { name: 'Play Cards', data: gameManager.clientCardManager.cardsInHand });
	}

	pickPlayableCard(event: MouseEvent): void
	{
		this.cardAnimation = CardAnimation.AnimateToInventory;
		this._cardService.pickCard();
		event.stopPropagation();
	}
}
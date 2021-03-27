import { AfterViewInit, Component, Input, OnInit, Output, ViewChild, EventEmitter } from '@angular/core';
import { Resource } from 'src/app/game/entities/resource';
import { Card, CardTier } from '../../../cards/card';

export enum PlayableCardAnimation
{
	None = 'no-animation',
	AnimateOut = 'animate-out',
	AnimateIn = 'animate-in',
	AnimateToInventory = 'animate-to-inventory'
}

@Component({
  selector: 'app-playable-card',
  templateUrl: './playable-card.component.html',
  styleUrls: ['./playable-card.component.scss']
})
export class PlayableCardComponent implements OnInit, AfterViewInit
{
	@Input() card: Card;
	selectedTier: number = 0;

	@ViewChild('descriptionBody', { static: true }) descriptionBody;

	@ViewChild('parentdiv', {static: true}) parentdiv;

	@Input()
	cardAnimation: PlayableCardAnimation;

	@Output()
	onTransitionEnd: EventEmitter<null> = new EventEmitter<null>();

	constructor()
	{
	}

	ngOnInit()
	{		
	}

	ngAfterViewInit()
	{
		this.setDescriptionText();
	}

	transitionEnd(e: Event): void
	{
		this.onTransitionEnd.emit();
		this.cardAnimation = PlayableCardAnimation.None;
	}

	get animateIn(): boolean
	{
		return this.cardAnimation === PlayableCardAnimation.AnimateIn;
	}

	get animateOut(): boolean
	{
		return this.cardAnimation === PlayableCardAnimation.AnimateOut;
	}

	get animateToInventory(): boolean
	{
		return this.cardAnimation === PlayableCardAnimation.AnimateToInventory;
	}

	setDescriptionText(): void
	{
		const iconTag = /(?=\{)(.*?)(?<=\})/g;
		let newString = this.currentDescription;
		let m;
		do 
		{
			m = iconTag.exec(this.currentDescription);
			if (m) 
			{
				const icon = `<i style="display: inline-block;
				width: 25px;
				height: 25px;   
				background-image: url('${'assets/resources/' + m[1].replaceAll(/[{}]/g, '') + '.png'}');
				background-size: cover;
				background-position: 0 0;"></i>`;
				newString = newString.replace(m[1], icon);
			}
		} while (m);
		this.descriptionBody.nativeElement.innerHTML = newString;
	}

	get tierText(): string
	{
		return 'Tier ' + (this.selectedTier + 1).toString();
	}

	get currentTier(): CardTier
	{
		return this.card.tiers[this.selectedTier];
	}

	get currentDescription(): string
	{
		return this.card.description;
		//return this.currentTier.description;
	}

	get currentResources(): Resource[]
	{
		return this.currentTier.resources;
	}

	nextTier(target: MouseEvent): void
	{
		this.selectedTier++;
		this.setDescriptionText();
		target.stopPropagation();
	}

	previousTier(target: MouseEvent): void
	{
		this.selectedTier--;
		this.setDescriptionText();
		target.stopPropagation();
	}
}
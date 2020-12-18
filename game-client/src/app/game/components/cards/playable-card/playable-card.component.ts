import { Component, Input, OnInit } from '@angular/core';
import { Card, CardTier } from 'src/app/game/entities/card';
import { Resource } from 'src/app/game/entities/resource';

@Component({
  selector: 'app-playable-card',
  templateUrl: './playable-card.component.html',
  styleUrls: ['./playable-card.component.scss']
})
export class PlayableCardComponent implements OnInit 
{
	@Input() card: Card;
	selectedTier: number = 0;
	unselectCard: boolean = false;

	constructor()
	{
		
	}

	ngOnInit()
	{
		
	}

	reverseUnselectCard(): void
	{
		console.log("reverse unselect card");
		this.unselectCard = !this.unselectCard;
	}

	descriptionText(element: HTMLElement): void
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
				width: 15px;
				height: 15px;   
				background-image: url('${'assets/resources/' + m[1].replaceAll(/[{}]/g, '') + '.png'}');
				background-size: cover;
				background-position: 0 0;"></i>`;
				newString = newString.replace(m[1], icon);
			}
		} while (m);
		element.innerHTML = newString;
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
		return this.currentTier.description;
	}

	get currentResources(): Resource[]
	{
		return this.currentTier.resources;
	}

	nextTier(target: MouseEvent): void
	{
		this.selectedTier++;
		target.stopPropagation();
	}

	previousTier(target: MouseEvent): void
	{
		this.selectedTier--;
		target.stopPropagation();
	}
}
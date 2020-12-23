import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Card } from 'src/app/game/cards/card';

@Component({
  selector: 'app-outline-card',
  templateUrl: './outline-card.component.html',
  styleUrls: ['../playable-card/playable-card.component.scss', './outline-card.component.scss']
})
export class OutlineCardComponent implements OnInit 
{
	@Input() card: Card;
	@Output() onOutlineClicked: EventEmitter<Card> = new EventEmitter<Card>();

	constructor() 
	{
		
	}

	ngOnInit() 
	{

	}
}

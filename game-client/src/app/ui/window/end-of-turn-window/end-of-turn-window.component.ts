import { Component, OnInit } from '@angular/core';
import { InnerWindowComponent } from '../window.component';

@Component({
  selector: 'app-end-of-turn-window',
  templateUrl: './end-of-turn-window.component.html',
  styleUrls: ['./end-of-turn-window.component.scss', '../window.component.scss']
})
export class EndOfTurnWindowComponent implements OnInit, InnerWindowComponent
{
	public data: any;

	constructor() { }

	ngOnInit()
	{

	}

	beforeCloseWindow(n: number): void
	{
	}

	beforeOpenWindow(n: number): void
	{
	}

	afterCloseWindow(n: number): void
	{		
	}

	afterOpenWindow(n: number): void
	{
	}
}
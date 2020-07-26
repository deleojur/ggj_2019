import { Component, OnInit } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { GameManager } from 'src/app/game/game-manager';

@Component({
  selector: 'app-host-hud',
  templateUrl: './host-hud.component.html',
  styleUrls: ['./host-hud.component.scss', '../game-hud.scss']
})
export class HostHudComponent implements OnInit 
{
	time: number = 600;
	timerSubscription: Subscription;

	constructor() { }

	ngOnInit()
	{
		this.startNewRound();	
	}

	public startNewRound(): void
	{
		const source = interval(1000);		
		this.timerSubscription = source.subscribe(val => 
		{
			this.time--;
			if (this.time <= 0)
			{
				GameManager.instance.hostTurnSystem.onCountdownFinished();
			}
		});
	}

	getRemainingTime(): string
	{
		let minutes: number = Math.floor(this.time / 60);
		let seconds: number = Math.floor(this.time % 60);

		return ("00" + minutes).slice (-2) + ':' + ("00" + seconds).slice (-2);
	}
}
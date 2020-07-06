import { Component, OnInit } from '@angular/core';
import { Hex } from 'honeycomb-grid';
import { Cell } from 'src/app/game/grid/grid';
import { BehaviorInformation, Entity } from 'src/app/game/entities/entity';
import { GameManager } from 'src/app/game/game-manager';
import { InnerWindowComponent } from '../window.component';
import { TurnInformation } from 'src/app/game/turns/turn-command';
import { WindowType } from '../window-manager';
import { ButtonEvent } from '../../menu-item/menu-item.component';

@Component({
  selector: 'app-item-window',
  templateUrl: './item-overview-window.component.html',
  styleUrls: ['./item-overview-window.component.scss', '../window.component.scss']
})
export class ItemOverviewWindowComponent implements OnInit, InnerWindowComponent
{
	activeBehaviors: Map<Entity, BehaviorInformation>;

	data: any;
	hex: Hex<Cell>;
	entities: Entity[];
	width: string = '45vh';
	top: string = '-50px';

  	constructor()
	{
		
	}

	ngOnInit() 
	{
		this.hex = this.data.origin;
		this.entities = this.data.entities;
		
		this.activeBehaviors = new Map<Entity, BehaviorInformation>();
		
		const turnInformation: TurnInformation[] = GameManager.instance.turnSystem.getTurnInformation(this.hex);
		this.entities.forEach(entity =>
		{
			turnInformation.forEach(turn =>
			{
				if (turn.originEntity === entity || turn.targetEntity === entity)
				{
					this.activeBehaviors.set(entity, turn.behaviorInformation);
				}
			});
		});
	}

	getEntityBehavior(entity: Entity): BehaviorInformation[]
	{
		if (this.activeBehaviors.has(entity))
		{
			const behaviors: BehaviorInformation[] = [this.activeBehaviors.get(entity)];
			this.setBehaviorInformation(behaviors, 'assets/UI/button/r_skull.PNG', this.displayDetailsPage.bind(this), this.cancelItem.bind(this));
			return behaviors;
		} else
		{
			this.setBehaviorInformation(entity.behaviors, 'assets/UI/button/r_scroll.PNG', this.buyItem.bind(this), this.displayDetailsPage.bind(this));
			return entity.behaviors;
		}
	}

	setBehaviorInformation(
		behaviors: BehaviorInformation[],
		secondaryActionImgUrl: string, 
		onClickPrimary: (behavior: BehaviorInformation, entity: Entity) => void,
		onClickSecondary: (behavior: BehaviorInformation, entity: Entity) => void): void
	{		
		behaviors.forEach(behavior =>
		{
			behavior.secondaryActionImgUrl = secondaryActionImgUrl;
			behavior.onClickPrimary = onClickPrimary;
			behavior.onClickSecondary = onClickSecondary;
		});
	}

	displayDetailsPage(behaviorInformation: BehaviorInformation)
	{
		GameManager.instance.windowManager.openWindow(WindowType.ItemDetail, { name: behaviorInformation.name, data: { origin: this.hex, item: behaviorInformation } });
	}

	cancelItem(buttonEvent: ButtonEvent): void
	{
		const behavior: BehaviorInformation = buttonEvent.behavior;
		const entity: Entity = buttonEvent.entity;
		GameManager.instance.cancelAcquireItem(behavior, this.hex, entity);
	}

	buyItem(buttonEvent: ButtonEvent): void
	{
		const behavior: BehaviorInformation = buttonEvent.behavior;
		const entity: Entity = buttonEvent.entity;
		GameManager.instance.resourceManager.tryAcquireItem(behavior, this.hex, entity);
	}

	beforeCloseWindow(n: number): void
	{
		if (n == 0)
		{
			GameManager.instance.grid.clearSelectedCells();
		}
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

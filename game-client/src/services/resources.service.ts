import { Injectable } from '@angular/core';
import { Resource} from 'src/app/game/entities/resource';
import { Cell } from 'src/app/game/grid/grid';
import { Hex } from 'honeycomb-grid';
import { EntityInformation, BehaviorInformation } from 'src/app/game/entities/entity';
import { GameManager } from 'src/app/game/game-manager';
import { TurnInformation } from 'src/app/game/turns/turn-command';
import { WindowService, WindowType } from './window.service';

@Injectable
({
  providedIn: 'root'
})
export class ResourcesService
{
	private resourcePool: Map<string, Resource>;

	constructor(private windowService: WindowService)
	{
		this.resourcePool = new Map<string, Resource>();
		this.resourcePool.set("gold", new Resource("gold", 10));
		this.resourcePool.set("food", new Resource("food", 10));
		this.resourcePool.set("population", new Resource("population", 4));
	}

	public get $resourcePool(): Resource[]
	{
		return Array.from(this.resourcePool.values());
	}

	public getResourceAmount(type: string): number
	{
		return this.resourcePool.get(type).amount;
	}

	public addResource(resources: Resource[]): void
	{
		for (let i = 0; i < resources.length; i++)
		{
			const resource: Resource = resources[i];
			this.resourcePool.get(resource.type).amount += resource.amount;
		}
	}

	private subtractResources(resources: Resource[]): void
	{
		for (let i = 0; i < resources.length; i++)
		{
			const resource: Resource = resources[i];
			this.resourcePool.get(resource.type).amount -= resource.amount;
		}
	}

	public trySubtractResources(resources: Resource[]): boolean
	{
		if (this.areResourcesConditionsMet(resources)) //all conditions are met or else nothing happens
		{
			for (let i = 0; i < resources.length; i++)
			{
				const resource: Resource = resources[i];
				this.resourcePool.get(resource.type).amount -= resource.amount;
			}
			return true;
		}
		return false;
	}

	public isResourceConditionMet(resource: Resource): boolean
	{
		const pool = this.resourcePool.get(resource.type);
		return pool.amount >= resource.amount;
	}

	public areResourcesConditionsMet(resources: Resource[]): boolean
	{
		for (let i: number = 0; i < resources.length; i++)
		{
			const resource = resources[i];
			const pool = this.resourcePool.get(resource.type);
			if (pool.amount < resource.amount)
			{
				return false;
			}
		}
		return true;
	}

	public tryPurchaseItem(item: BehaviorInformation, origin: Hex<Cell>): boolean
	{
		if (this.areResourcesConditionsMet(item.cost))
		{
			this.windowService.closeWindow(() =>
			{
				this.subtractResources(item.cost);
				console.log(item);
				if (item.range > 0)
				{
					this.windowService.openWindow(WindowType.SelectCell, { name: '¿Que?', data: 
					{
						//get a list of possible tiles.
						origin: origin
					}});
				}
				//get some more information, like the target cell.
				/*var blaat: TurnInformation = 
				{
					originCell: origin,
					targetCell: null, //get the target cell, if applicable.
					originEntity: this.origin.entity, //the entity before the command started.
					targetEntity: null, //create a new entity if there is one in the item.
					textureUrl: this.item.textureUrl,
					destroysSelf: this.item.destroySelf
				};*/
			});
			return true;
		}
		return false;
	}
}

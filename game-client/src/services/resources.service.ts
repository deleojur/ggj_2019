import { Injectable } from '@angular/core';
import { Resource} from 'src/app/game/entities/resource';
import { Cell } from 'src/app/game/grid/grid';
import { Hex } from 'honeycomb-grid';
import { GameService } from './game.service';
import { EntityInformation } from 'src/app/game/entities/entity';

@Injectable
({
  providedIn: 'root'
})
export class ResourcesService
{
	private resourcePool: Map<string, Resource>;

	constructor(private gameService: GameService)
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

	public tryPurchaseItem(origin: Hex<Cell>, item: EntityInformation): boolean
	{
		if (!this.trySubtractResources(item.cost))
		{
			return false;
		}

		this.gameService.createEntity(origin, 'bob', item.name);
		return true;
	}
}

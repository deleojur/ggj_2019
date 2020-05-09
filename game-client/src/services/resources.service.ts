import { Injectable } from '@angular/core';
import { Resource, ResourceType, BuyableItemModel } from 'src/app/ui/menu-item/buyableItem-model';
import { Cell } from 'src/app/game/grid/grid';
import { Hex } from 'honeycomb-grid';
import { GameService } from './game.service';

@Injectable
({
  providedIn: 'root'
})
export class ResourcesService
{
	private resourcePool: Map<ResourceType, Resource>;

	constructor(private gameService: GameService)
	{
		this.resourcePool = new Map<ResourceType, Resource>();
		this.resourcePool.set(ResourceType.Gold, new Resource(ResourceType.Gold, 10));
		this.resourcePool.set(ResourceType.Food, new Resource(ResourceType.Food, 10));
		this.resourcePool.set(ResourceType.Population, new Resource(ResourceType.Population, 4));
	}

	public get $resourcePool(): Resource[]
	{
		return Array.from(this.resourcePool.values());
	}

	public getResourceAmount(resourceType: ResourceType): number
	{
		return this.resourcePool.get(resourceType).$amount;

	}

	public addResource(resources: Resource[]): void
	{
		for (let i = 0; i < resources.length; i++)
		{
			const resource: Resource = resources[i];
			this.resourcePool.get(resource.$resourceType).$amount += resource.$amount;
		}
	}

	public trySubtractResources(resources: Resource[]): boolean
	{
		if (this.areResourcesConditionsMet(resources)) //all conditions are met or else nothing happens
		{
			for (let i = 0; i < resources.length; i++)
			{
				const resource: Resource = resources[i];
				this.resourcePool.get(resource.$resourceType).$amount -= resource.$amount;
			}
			return true;
		}
		return false;
	}

	public isResourceConditionMet(resource: Resource): boolean
	{
		const pool = this.resourcePool.get(resource.$resourceType);
		return pool.$amount >= resource.$amount;
	}

	public areResourcesConditionsMet(resources: Resource[]): boolean
	{
		for (let i: number = 0; i < resources.length; i++)
		{
			const resource = resources[i];
			const pool = this.resourcePool.get(resource.$resourceType);
			if (pool.$amount < resource.$amount)
			{
				return false;
			}
		}
		return true;
	}

	public tryPurchaseItem(origin: Hex<Cell>, item: BuyableItemModel): boolean
	{
		if (!this.trySubtractResources(item.$cost))
		{
			return false;
		}

		this.gameService.createEntity(origin, 'bob', item.$name);
		return true;
	}
}

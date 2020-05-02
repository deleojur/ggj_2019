import { Injectable } from '@angular/core';
import { Resource as Resource, ResourceType } from 'src/app/ui/menu-item/buyableItem-model';

@Injectable
({
  providedIn: 'root'
})
export class ResourcesService
{
	private resourcePool: Map<ResourceType, number>;
	constructor()
	{
		this.resourcePool = new Map<ResourceType, number>();
		this.resourcePool.set(ResourceType.Gold, 10);
		this.resourcePool.set(ResourceType.Food, 5);
		this.resourcePool.set(ResourceType.Population, 4);
	}

	public getResourceAmount(resourceType: ResourceType): number
	{
		return this.resourcePool.get(resourceType);
	}

	public addResourceAmount(resourceType: ResourceType, addedAmount: number): void
	{
		const currentAmount = this.resourcePool.get(resourceType);
		this.resourcePool.set(resourceType, currentAmount + addedAmount);
	}

	public subtractResourceAmount(resourceType: ResourceType, subtractedAmount: number): boolean
	{
		const currentAmount = this.resourcePool.get(resourceType);
		this.resourcePool.set(resourceType, currentAmount - subtractedAmount);
		return this.resourcePool.get(resourceType) > 0;
	}

	public areResourcesConditionsMet(resources: Resource[]): boolean
	{
		for (let i: number = 0; i < resources.length; i++)
		{
			const resource = resources[i];
			const pool = this.resourcePool.get(resource.$resourceType);
			if (pool < resource.$amount)
			{
				return false;
			}
		}
		return true;
	}
}

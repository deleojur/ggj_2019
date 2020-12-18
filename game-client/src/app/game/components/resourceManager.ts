import { Resource} from 'src/app/game/entities/resource';
import { Cell } from 'src/app/game/grid/grid';
import { Hex } from 'honeycomb-grid';
import { BehaviorInformation, Entity } from 'src/app/game/entities/entity';
import { GameManager } from 'src/app/game/game-manager';

export class ResourceManager
{
	private _resourcePool: Map<string, Resource>;

	public init(gold: number, food: number, lumber: number, stone: number, influence: number): void
	{
		this._resourcePool = new Map<string, Resource>();
		this._resourcePool.set("gold", new Resource("gold", gold));
		this._resourcePool.set("food", new Resource("food", food));
		this._resourcePool.set("lumber", new Resource("logs", lumber));
		this._resourcePool.set("stone", new Resource("stone", stone));
		this._resourcePool.set("influence", new Resource("influence", influence));		
	}

	public get resourcePool(): Resource[]
	{
		return Array.from(this._resourcePool.values());
	}

	public getResourceAmount(type: string): number
	{
		return this._resourcePool.get(type).amount;
	}

	public addResource(resources: Resource[]): void
	{
		if (resources)
		{
			for (let i = 0; i < resources.length; i++)
			{
				const resource: Resource = resources[i];
				this._resourcePool.get(resource.type).amount += resource.amount;
			}
		}
	}

	public subtractResources(resources: Resource[]): void
	{
		if (resources)
		{
			for (let i = 0; i < resources.length; i++)
			{
				const resource: Resource = resources[i];
				this._resourcePool.get(resource.type).amount -= resource.amount;
			}
		}
	}

	public trySubtractResources(resources: Resource[]): boolean
	{
		if (this.areResourcesConditionsMet(resources)) //all conditions are met or else nothing happens
		{
			for (let i = 0; i < resources.length; i++)
			{
				const resource: Resource = resources[i];
				this._resourcePool.get(resource.type).amount -= resource.amount;
			}
			return true;
		}
		return false;
	}

	public isResourceConditionMet(resource: Resource): boolean
	{
		const pool = this._resourcePool.get(resource.type);
		return pool.amount >= resource.amount;
	}

	public areResourcesConditionsMet(resources: Resource[]): boolean
	{
		if (resources)
		{
			for (let i: number = 0; i < resources.length; i++)
			{
				const resource = resources[i];
				const pool = this._resourcePool.get(resource.type);
				if (pool.amount < resource.amount)
				{
					return false;
				}
			}
		}
		return true;
	}

	public tryAcquireItem(item: BehaviorInformation, origin: Hex<Cell>, entity: Entity): boolean
	{
		if (this.areResourcesConditionsMet(item.cost))
		{
			GameManager.instance.acquireItem(item, origin, entity);
			return true;
		}
		return false;
	}
}

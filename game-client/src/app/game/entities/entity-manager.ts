import { Sprite, Loader, Texture } from 'pixi.js';
import { Cell } from '../grid/grid';
import { Hex } from 'honeycomb-grid';
import { Entity, EntityPrototype, EntityType } from './entity';
import { ResourceInformation } from './entity';
import { Resource, ResourceType } from 'src/app/ui/menu-item/buyableItem-model';

export class EntityManager
{
	private _entityPrototypes: Map<string, EntityPrototype>;
	private _entities: Map<Hex<Cell>, Entity>;

	public createEntity(origin: Hex<Cell>, ownerId: string, entityName: string): Entity
	{
		const entity: Entity = this._entityPrototypes.get(entityName) as Entity;
		entity.construct(origin, ownerId);
		this._entities.set(origin, entity);
		return entity;
	}

	constructor()
	{
		this._entities = new Map<Hex<Cell>, Entity>();
		this._entityPrototypes = new Map<string, EntityPrototype>();
	}

	public getEntityPrototype(origin: Hex<Cell>): EntityPrototype[]
	{
		return Array.from(this._entityPrototypes.values());
	}

	public async loadEntityPrototypes(): Promise<void>
	{
		return new Promise(resolve => 
		{
			const loader: Loader = new Loader();
			const entityPrototypesUrl: string = 'assets/entities/entities.json';

			loader.add(entityPrototypesUrl);
			loader.load((loader, resources) =>
			{
				const entityProperties: any[] = resources[entityPrototypesUrl].data as any[];
				
				loader.reset();
				entityProperties.forEach(e =>
				{					
					loader.add(e.textureUrl);
				});
				loader.load((loader, resources) =>
				{
					entityProperties.forEach(e =>
					{
						this.createEntityPrototype(resources, e)
					});
					resolve();
				});
			});
		});
	}

	private createEntityPrototype(resources, e: any): void
	{
		const texture: Texture = Texture.from(resources[e.textureUrl].data);
		e.texture = texture;
		const entityType: EntityType = (<any>EntityType)[e.type];
		const cost: Resource[] = this.translateResourceInformation(e.cost);
		const upkeep: Resource[] = this.translateResourceInformation(e.upkeep);
		const entity: Entity = 
			new Entity(e.name, e.description,  e.textureUrl, texture, entityType, cost, upkeep);
		this._entityPrototypes.set(e.name, entity);
	}

	private translateResourceInformation(resourceInformation: ResourceInformation[]): Resource[]
	{
		const resource: Resource[] = [];
		resourceInformation.forEach(e =>
		{
			resource.push(new Resource((<any>ResourceType)[e.name], e.amount));
		});
		return resource;
	}
}
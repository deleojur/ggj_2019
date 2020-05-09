import { Sprite, Loader, Texture } from 'pixi.js';
import { Cell } from '../grid/grid';
import { Hex } from 'honeycomb-grid';
import { Entity, EntityPrototype } from './entity';

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
		//load all textures into a map.
		
	}

	public async loadEntityPrototypes(): Promise<void>
	{
		return new Promise(resolve => 
		{
			this._entityPrototypes = new Map<string, EntityPrototype>();
			const loader: Loader = new Loader();
			const entityPrototypesUrl: string = 'assets/entities/entities.json';

			loader.add(entityPrototypesUrl);
			loader.load((loader, resources) =>
			{
				const entityProperties: EntityPrototype[] = resources[entityPrototypesUrl].data as EntityPrototype[];
				loader.reset();
				entityProperties.forEach(e =>
				{
					loader.add(e.textureUrl);
				});
				loader.load((loader, resources) =>
				{
					entityProperties.forEach(e =>
					{
						const texture: Texture = resources[e.textureUrl].data as Texture;
						e.texture = texture;
						this._entityPrototypes.set(e.name, e as EntityPrototype);
					});
					resolve();
				});
			});
		});
	}
}
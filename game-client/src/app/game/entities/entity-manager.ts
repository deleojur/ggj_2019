import { Cell } from '../grid/grid';
import { Hex } from 'honeycomb-grid';
import { Entity, EntityType, EntityFactory, BehaviorInformation } from './entity';
import { AssetLoader } from 'src/app/asset-loader';
import { Structure } from './structure';
import { Unit } from './unit';

export class EntityManager
{
	private _entities: Map<Hex<Cell>, Entity>;

	public createEntity(origin: Hex<Cell>, ownerId: string, entityName: string): Entity
	{
		const entityPrototype = AssetLoader.instance.entityPrototype(entityName);
		const entityFactory: EntityFactory<Entity> = this.getEntity(entityPrototype.entityType);
		const entity = new entityFactory.entityClass(entityPrototype, origin, ownerId);

		this._entities.set(origin, entity);
		return entity;
	}

	private getEntity(entityType: EntityType): EntityFactory<Entity>
	{
		switch (entityType)
		{
			case EntityType.Structure:
				return new EntityFactory<Entity>(Structure);
			
			case EntityType.Unit:
				return new EntityFactory<Entity>(Unit);
		}
	}

	public removeEntity(origin: Hex<Cell>): Entity
	{
		const entity: Entity = this._entities.get(origin);
		this._entities.delete(origin);
		return entity;
	}

	constructor()
	{
		this._entities = new Map<Hex<Cell>, Entity>();
	}
}
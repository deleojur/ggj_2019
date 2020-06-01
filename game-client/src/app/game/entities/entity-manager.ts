import { Cell } from '../grid/grid';
import { Hex } from 'honeycomb-grid';
import { Entity } from './entity';
import { AssetLoader } from 'src/app/asset-loader';

export class EntityManager
{
	private _entities: Map<Hex<Cell>, Entity>;

	public createEntity(origin: Hex<Cell>, ownerId: string, entityName: string): Entity
	{
		const entityPrototype = AssetLoader.instance.entityPrototype(entityName);
		const entity = new Entity(entityPrototype, origin, ownerId);
		this._entities.set(origin, entity);
		return entity;
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
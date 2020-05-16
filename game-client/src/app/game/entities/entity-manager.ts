import { Sprite, Loader, Texture } from 'pixi.js';
import { Cell } from '../grid/grid';
import { Hex } from 'honeycomb-grid';
import { Entity, EntityPrototype, EntityType, EntityInformation } from './entity';
import { Resource } from 'src/app/game/entities/resource';
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

	constructor()
	{
		this._entities = new Map<Hex<Cell>, Entity>();
	}

	public getEntityPrototype(origin: Hex<Cell>): EntityInformation[]
	{
		return Array.from(AssetLoader.instance.entityInformation.values());
	}
}
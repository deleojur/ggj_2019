import { Cell } from '../grid/grid';
import { Hex } from 'honeycomb-grid';
import { Entity, EntityType, EntityFactory, BehaviorInformation } from './entity';
import { AssetLoader } from 'src/app/asset-loader';
import { Structure } from './structure';
import { Unit } from './unit';
import { GameManager } from '../game-manager';

export class EntityManager
{
	private _entities: Map<Hex<Cell>, Entity[]>;

	public createEntity(hex: Hex<Cell>, ownerId: string, entityName: string): Entity
	{
		const entityPrototype = AssetLoader.instance.entityPrototype(entityName);
		const entityFactory: EntityFactory<Entity> = this.getEntityType(entityPrototype.entityType);
		const entity = new entityFactory.entityClass(entityPrototype, hex, ownerId);

		if (this._entities.has(hex))
		{
			const entities: Entity[] = this._entities.get(hex);
			entities.push(entity);
		}
		return entity;
	}

	private getEntityType(entityType: EntityType): EntityFactory<Entity>
	{
		switch (entityType)
		{
			case EntityType.Structure:
				return new EntityFactory<Entity>(Structure);
			
			case EntityType.Unit:
				return new EntityFactory<Entity>(Unit);
		}
	}

	public getEntitiesAtHex(hex: Hex<Cell>): Entity[]
	{
		if (this._entities.has(hex))
		{
			return this._entities.get(hex);
		}
		return [];
	}

	public addEntity(hex: Hex<Cell>, entity: Entity): void
	{
		const entities: Entity[] = this._entities.get(hex);
		entities.push(entity);
	}

	public removeEntity(hex: Hex<Cell>, entity: Entity): boolean
	{
		const entities: Entity[] = this._entities.get(hex);
		const index: number = entities.indexOf(entity);
		if (index > -1)
		{
			entities.splice(index, 1);
			return true;
		}
		return false;
	}

	public moveEntityToHex(entity: Entity, from: Hex<Cell>, to: Hex<Cell>): void
	{
		this.addEntity(to, entity);
		this.removeEntity(from, entity);
	}

	constructor()
	{
		this._entities = new Map<Hex<Cell>, Entity[]>();
		const validTiles: Hex<Cell>[] = GameManager.instance.grid.getValidTiles();
		validTiles.forEach(hex =>
		{
			this._entities.set(hex, []);
		});
	}
}
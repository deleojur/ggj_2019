import { EntityBehavior } from './entity-behavior/entity-behavior';
import { Resource } from 'src/app/ui/menu-item/buyableItem-model';
import { Sprite, Texture } from 'pixi.js';
import { Hex } from 'honeycomb-grid';
import { Cell } from '../grid/grid';

export enum EntityType
{
	Community,
	Individual,
	Structure
}

export interface EntityPrototype
{
	name: string;
	type: EntityType;
	texture: Texture;
	textureUrl: string;
	cost: Resource[];
	upkeep?: Resource[];
}

//TODO: implement the prototype pattern?

export class Entity extends Sprite implements EntityPrototype
{
	public get name(): string 
	{
		return this._name;
	}

	public get type(): EntityType
	{
		return this._type;
	}

	public get textureUrl(): string
	{
		return this._textureUrl;
	}

	public get cost(): Resource[]
	{
		return this._cost;
	}
	
	public get upkeep(): Resource[]
	{
		return this._upkeep;
	}

	public get ownerId(): string
	{
		return this._ownerId;
	}

	//TODO: set the owner.
	public construct(location: Hex<Cell>, ownerId: string): this
	{
		const clone: this = Object.create(this);
		clone._behaviors = []; //TODO: add the correct behaviors.
		clone._location = location;
		clone._ownerId = ownerId;
        return clone;
    }

	private _behaviors: EntityBehavior[];
	private _location: Hex<Cell>;
	private _ownerId: string;

	constructor(
		private _name: string,
		private _textureUrl: string,
		private _type: EntityType,
		private _cost: Resource[],
		private _upkeep?: Resource[])
	{
		super();
	}
}
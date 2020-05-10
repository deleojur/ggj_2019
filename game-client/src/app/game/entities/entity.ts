import { EntityBehavior } from './entity-behavior/entity-behavior';
import { Resource, ResourceType } from 'src/app/ui/menu-item/buyableItem-model';
import { Sprite, Texture } from 'pixi.js';
import { Hex } from 'honeycomb-grid';
import { Cell } from '../grid/grid';

export enum EntityType
{
	Community,
	Individual,
	Structure
}

export interface ResourceInformation
{
	name: string, 
	amount: number
}

export interface EntityPrototype
{
	name: string;
	type: EntityType;
	description: string;
	textureUrl: string;
	texture: Texture;
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

	public get description(): string
	{
		return this._decription;
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
	public construct(location: Hex<Cell>, ownerId: string): Entity
	{
		const clone: Entity = Object.create(this);
		clone._behaviors = []; //TODO: add the correct behaviors.
		clone._location = location;
		clone._ownerId = ownerId;
		clone.texture = this._texture;
        return clone;
    }

	private _behaviors: EntityBehavior[];
	private _location: Hex<Cell>;
	private _ownerId: string;

	constructor(
		private _name: string,
		private _decription: string,
		private _textureUrl: string,
		private _texture: Texture,
		private _type: EntityType,
		private _cost: Resource[],
		private _upkeep?: Resource[])
	{
		super();
	}
}
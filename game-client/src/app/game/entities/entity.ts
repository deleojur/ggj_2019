import { EntityBehavior } from './entity-behavior/entity-behavior';
import { Resource } from 'src/app/game/entities/resource';
import { Sprite, Texture } from 'pixi.js';
import { Hex } from 'honeycomb-grid';
import { Cell } from '../grid/grid';

export enum EntityType
{
	Community,
	Individual,
	Structure
}

export interface EntityInformation
{
	name: string;
	description: string;
	textureUrl: string;
	cost: Resource[];
	upkeep?: Resource[];
}

export class EntityPrototype
{
	constructor(public name: string, public texture: Texture, public behavior: EntityBehavior)
	{
		//(<any>EntityType)[e.name]
	}
}

//TODO: implement the prototype pattern?

export class Entity extends Sprite
{	
	private _behaviors: EntityBehavior[];

	constructor(private prototype: EntityPrototype, private _location: Hex<Cell>, private _ownerId: string)
	{
		super(prototype.texture);
		console.log(prototype);
	}
}
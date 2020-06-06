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

export interface PrototypeInformation
{
	name: string;
	textureUrl: string;
	description: string;
	cost?: Resource[];
	upkeep?: Resource[];
}

export interface EntityInformation extends PrototypeInformation
{
	behaviors?: BehaviorInformation[];
}

export interface BehaviorInformation extends PrototypeInformation
{
	type: string;
	range: number;
	creates?: string;
	commandIconTextureUrl: string;
}

export class EntityPrototype
{
	constructor(public name: string, public texture: Texture, public behaviors: BehaviorInformation[])
	{
				
	}
}

export class Entity extends Sprite
{	
	public get behaviors(): BehaviorInformation[]
	{
		return this._prototype.behaviors;
	}

	constructor(private _prototype: EntityPrototype, private _location: Hex<Cell>, private _ownerId: string)
	{
		super(_prototype.texture);
	}
}
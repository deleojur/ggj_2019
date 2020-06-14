import { Resource } from 'src/app/game/entities/resource';
import { Sprite, Texture, Container, Point as pPoint } from 'pixi.js';
import { Hex, Point } from 'honeycomb-grid';
import { Cell } from '../grid/grid';
import { Vector } from 'vector2d';
import { AssetLoader } from 'src/app/asset-loader';

export enum EntityType
{
	Structure,
	Unit
}

export interface PrototypeInformation
{
	name: string;
	textureUrl: string;
	description: string;
	cost?: Resource[];
	upkeep?: Resource[];
	entityType: string;
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
	commandIconTextureUrl?: string;
	secondaryActionImgUrl?: string;
	onClickPrimary?: (behavior: BehaviorInformation) => void;
	onClickSecondary?: (behavior: BehaviorInformation) => void;
}

export class EntityPrototype
{
	constructor(
		public name: string,
		public entityType: EntityType,
		public textureUrl: string,
		public behaviors: BehaviorInformation[])
	{
	}
}

export class EntityFactory<T extends Entity>
{
	constructor ( public readonly entityClass: new (prototype: EntityPrototype, location: Hex<Cell>, ownerId: string) => T ) {}
}

export class Entity extends Container
{
	public get behaviors(): BehaviorInformation[]
	{
		return this._prototype.behaviors;
	}
	
	constructor(protected _prototype: EntityPrototype, protected _location: Hex<Cell>, protected _ownerId: string)
	{
		super();
		this.initialise();
	}

	protected initialise(): void
	{

	}

	public createCommandIcon(): void
	{
		
	}
}
import { Resource } from 'src/app/game/entities/resource';
import { Container, Point as pPoint } from 'pixi.js';
import { Hex, Point } from 'honeycomb-grid';
import { Cell } from '../grid/grid';

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

export interface EntityShareInformation
{
	entityName: string;
	hex: Hex<Cell>;
	ownerId: string;
}

export interface BehaviorInformation extends PrototypeInformation
{
	type: string;
	range: number;
	creates?: string;
	commandIconTextureUrl?: string;
	secondaryActionImgUrl?: string;
	entity: Entity;
	onClickPrimary?: (behavior: BehaviorInformation, entity: Entity) => void;
	onClickSecondary?: (behavior: BehaviorInformation, entity: Entity) => void;
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

export abstract class Entity extends Container
{
	private _guid: number = -1;

	public get owner(): string
	{
		return this._owner;
	}

	public get behaviors(): BehaviorInformation[]
	{
		return this._prototype.behaviors;
	}

	public get hex(): Hex<Cell>
	{
		return this._location;
	}

	public get guid(): number
	{
		return this._guid;
	}

	public set guid(value: number)
	{
		this._guid = value;
	}
	
	constructor(protected _prototype: EntityPrototype, protected _location: Hex<Cell>, protected _owner: string)
	{
		super();
		this.init();
		this.name = this._prototype.name;
	}

	public abstract moveToHex(hex: Hex<Cell>): void;
	protected abstract init(): void;
}
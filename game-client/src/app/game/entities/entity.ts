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

export class Entity extends Container
{
	public get name(): string
	{
		return this._prototype.name;
	}

	public get behaviors(): BehaviorInformation[]
	{
		return this._prototype.behaviors;
	}
	
	constructor(protected _prototype: EntityPrototype, protected _location: Hex<Cell>, protected _ownerId: string)
	{
		super();
		this.initialise();
	}

	public moveToHex(hex: Hex<Cell>): void
	{
		const pos: Point = hex.toPoint().add(hex.center());
		this.position = new pPoint(pos.x, pos.y);
	}

	protected initialise(): void
	{

	}

	public createCommandIcon(): void
	{
		
	}
}
import { Resource } from 'src/app/game/entities/resource';
import { Container, Sprite, Point, Text } from 'pixi.js';
import { Hex } from 'honeycomb-grid';
import { Cell } from '../grid/grid';
import { GameManager } from '../game-manager';

export enum EntityType
{
	Structure,
	Unit
}

export interface PrototypeInformation
{
	name: string;
	textureUrl: string;

	cost?: Resource[];
	upkeep?: Resource[];
}

export interface EntityInformation extends PrototypeInformation
{
	entityType: string;
	behaviors: string[];
	defense: number;
	offense: number; 
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
	description: string;
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
		public behaviors: BehaviorInformation[],
		public upkeep: Resource[],
		public defense: number,
		public offense: number)
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
	private _offense: number = -1;
	private _defense: number = -1;

	public get owner(): string
	{
		return this._owner;
	}

	public set owner(value: string)
	{
		this._owner = value;
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

	public get upkeep(): Resource[]
	{
		return this._prototype.upkeep;
	}

	public get offense(): number
	{
		return this._offense;
	}

	public set offense(val: number)
	{
		this._offense = val;
	}
	
	public get defense(): number
	{
		return this._defense;
	}

	public set defense(val: number)
	{
		this._defense = val;
	}

	constructor(protected _prototype: EntityPrototype, protected _location: Hex<Cell>, protected _owner: string)
	{
		super();

		this.name = this._prototype.name;
		this._defense = this._prototype.defense;
		this._offense = this._prototype.offense;

		this.init();
	}

	public abstract moveToHex(hex: Hex<Cell>): void;
	protected abstract init(): void;

	protected displayPowericon(game: GameManager): void
	{
		if (this.defense > 0)
		{
			const unit_atk_art1: Sprite = game.createSprite('assets/units/frames/unit_atk_art.png', new Point(20, 110), new Point(0.4, 0.4));
			const unit_atk_art2: Sprite = game.createSprite('assets/units/frames/unit_atk_art.png', new Point(-20, 110), new Point(0.4, 0.4));
			const unit_health: Sprite = game.createSprite('assets/units/frames/unit_health.png', new Point(0, 120), new Point(0.34, 0.34));

			const textColor: number = GameManager.instance.gridStrategy.StateHandler.getColor(this._owner);
			const offenseText: Text = game.createText(new Point(-10, 100), this.offense.toString(), textColor);
			const dividerText: Text = game.createText(new Point(0, 110), '/', textColor);
			const defenseText: Text = game.createText(new Point(10, 120), this.defense.toString(), textColor);
			
			unit_atk_art1.angle = 45;
			unit_atk_art2.angle = 315;

			this.addChild(unit_atk_art1);
			this.addChild(unit_atk_art2);
			this.addChild(unit_health);

			this.addChild(offenseText);
			this.addChild(dividerText);
			this.addChild(defenseText);
		}
	}
}
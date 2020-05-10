import { Hex } from 'honeycomb-grid';
import { Cell } from '../grid/grid';
import { Sprite } from 'pixi.js';
import { Entity } from '../entities/entity';

export class TurnCommand
{
	//this is the place where the command originates.
	protected _origin: Hex<Cell>;
	protected _entity: Entity;
	protected _icon: Sprite;

	public get origin(): Hex<Cell>
	{
		return this._origin;
	}
	
	constructor(origin: Hex<Cell>)
	{
		this._origin = origin;
	}
}
import { Hex } from 'honeycomb-grid';
import { Cell } from '../grid/grid';
import { Sprite, Container, Texture, Point } from 'pixi.js';
import { Entity, BehaviorInformation } from '../entities/entity';
import { AssetLoader } from 'src/app/asset-loader';
import { Resource } from '../entities/resource';
import { CommandIcon } from './command-icon';

export interface TurnInformation
{
	behaviorInformation: BehaviorInformation,
	originEntity: Entity; //the entity before the turn.
	targetEntity: Entity; //the entity after the turn is played.
	iconTextureUrl: string; //icon that appears when the move isn't final yet for indication.
	originCell: Hex<Cell>; //the cell before the turn.
	targetCell?: Hex<Cell>; //the cell after the turn is played.
}

export class TurnCommand
{
	//this is the place where the command originates.	
	private _owner: string;
	private _commandIcon: CommandIcon;

	constructor(owner: string, public turnInformation: TurnInformation)
	{
		this._commandIcon = new CommandIcon(turnInformation);	
	}

	public get commandIcon(): CommandIcon
	{
		return this._commandIcon;
	}
}
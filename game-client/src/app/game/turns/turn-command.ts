import { Hex } from 'honeycomb-grid';
import { Cell } from '../grid/grid';
import { Entity, BehaviorInformation } from '../entities/entity';
import { CommandIcon } from './command-icon';

export interface TurnInformation
{
	behaviorInformation: BehaviorInformation,
	originEntity: Entity; //the entity before the turn.
	targetEntity: Entity; //the entity after the turn is played.
	originCell: Hex<Cell>; //the cell before the turn.
	targetCell?: Hex<Cell>; //the cell after the turn is played.
}

export class TurnCommand
{
	private _commandIcon: CommandIcon;

	constructor(private _owner: string, private _turnInformation: TurnInformation)
	{		
		this._commandIcon = new CommandIcon(_turnInformation);	
	}

	public get owner(): string
	{
		return this._owner;
	}

	public get turnInformation(): TurnInformation
	{
		return this._turnInformation;
	}

	public get commandIcon(): CommandIcon
	{
		return this._commandIcon;
	}
}
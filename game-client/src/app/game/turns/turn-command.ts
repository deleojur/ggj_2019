import { Hex } from 'honeycomb-grid';
import { Cell } from '../grid/grid';
import { Entity, BehaviorInformation } from '../entities/entity';
import { CommandIcon } from './command-icon';

export class TurnInformation
{
	public get path(): Hex<Cell>[]
	{
		return this._path;
	}

	public get originalPath(): Hex<Cell>[]
	{
		return this._originalPath;
	}

	public get originCell(): Hex<Cell>
	{
		return this.originalPath[0];
	}

	public get currentCell(): Hex<Cell>
	{
		return this._path[0];
	}

	public get targetCell(): Hex<Cell>
	{
		return this._path[this._path.length - 1];
	}

	public get nextCell(): Hex<Cell>
	{
		return this.path.length > 0 ? this._path[1] : null;
	}

	public get previousCell(): Hex<Cell>
	{
		return this._previousCell;
	}

	public get targetEntity(): Entity 
	{
		return this._targetEntity;
	}

	public get length(): number
	{
		return this._path.length;
	}

	public set targetEntity(value: Entity) 
	{
		this._targetEntity = value;
	}

	public get originEntity(): Entity 
	{
		return this._originEntity;
	}

	public set originEntity(value: Entity) 
	{
		this._originEntity = value;
	}
	
	public get behaviorInformation(): BehaviorInformation 
	{
		return this._behaviorInformation;
	}

	public set behaviorInformation(value: BehaviorInformation) 
	{
		this._behaviorInformation = value;
	}

	public shift(): Hex<Cell>
	{
		this._previousCell = this.currentCell;
		return this._path.shift();
	}
	
	private _originalPath: Hex<Cell>[];
	private _previousCell: Hex<Cell>;
	constructor(
		private _behaviorInformation: BehaviorInformation,
		private _originEntity: Entity,
		private _targetEntity: Entity,
		private _path: Hex<Cell>[])
	{
		this._originalPath = this._path.slice();
		this._previousCell = this.currentCell;
	}
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
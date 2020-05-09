import { Hex } from 'honeycomb-grid';
import { Cell } from '../grid/grid';

export class TurnCommand
{
	//this is the place where the command originates.
	protected _origin: Hex<Cell>;

	public get origin(): Hex<Cell>
	{
		return this._origin;
	}
	
	constructor(origin: Hex<Cell>)
	{
		this._origin = origin;
	}
}
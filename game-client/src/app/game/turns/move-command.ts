import { TurnCommand } from './turn-command'
import { Hex } from 'honeycomb-grid';
import { Cell } from '../grid/grid';

export class MoveCommand extends TurnCommand
{
	constructor(origin: Hex<Cell>)
	{
		super(origin);
	}
}
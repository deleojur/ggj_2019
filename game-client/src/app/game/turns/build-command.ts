import { TurnCommand } from './turn-command'
import { Hex } from 'honeycomb-grid';
import { Cell } from '../grid/grid';

export class BuildCommand extends TurnCommand
{
	constructor(origin: Hex<Cell>)
	{
		super(origin);
	}
}
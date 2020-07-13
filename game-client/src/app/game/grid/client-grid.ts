import { ClientStateHandler } from '../states/client-states/client-state-handler';
import { GridStrategy } from './grid-strategy';

export class GridClient implements GridStrategy
{
	constructor(private clientStateHandler: ClientStateHandler)
	{

	}
}
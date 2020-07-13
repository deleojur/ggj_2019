import { HostStateHandler } from '../states/host-states/host-state-handler';
import { GridStrategy } from './grid-strategy';

export class HostGrid implements GridStrategy
{
	constructor(private hostStateHandler: HostStateHandler)
	{
		
	}
}
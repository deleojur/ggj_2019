import { GridStrategy } from './grid-strategy';
import { HostStateHandler } from '../states/host-states/host-state-handler';

export class HostGrid extends GridStrategy
{
	constructor(private hostStateHandler: HostStateHandler)
	{
		super(hostStateHandler);
	}
}
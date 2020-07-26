import { GridStrategy } from './grid-strategy';
import { HostStateHandler } from '../states/host-states/host-state-handler';

export class HostGrid extends GridStrategy
{
	constructor(private _hostStateHandler: HostStateHandler)
	{
		super(_hostStateHandler);
	}

	public get hostStateHandler(): HostStateHandler
	{
		return this._hostStateHandler
	}
}
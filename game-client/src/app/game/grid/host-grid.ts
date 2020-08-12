import { GridStrategy, RenderType } from './grid-strategy';
import { HostStateHandler } from '../states/host-states/host-state-handler';
import { GameManager } from '../game-manager';
import { TurnCommand, TurnInformation } from '../turns/turn-command';
import { Hex } from 'honeycomb-grid';
import { Cell } from './grid';

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

	protected renderCommandsByOwnerColor(): void
	{
		const allTurnInformation: Map<string, TurnInformation[]> = GameManager.instance.hostTurnSystem.getAllTurnInformation();
		this.clients.forEach(client =>
		{
			if (allTurnInformation.has(client.id))
			{
				const turnInformation: TurnInformation[] = allTurnInformation.get(client.id);
				this.renderTurnCommandPath(turnInformation, this.getColor(client.color));
			}
		});
	}
}
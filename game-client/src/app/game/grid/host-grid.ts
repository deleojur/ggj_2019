import { GridStrategy, RenderType } from './grid-strategy';
import { HostStateHandler } from '../states/host-states/host-state-handler';
import { GameManager } from '../game-manager';
import { ClientData } from '../states/request-data';
import { TurnCommand } from '../turns/turn-command';
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
		const allTurnCommands: Map<string, TurnCommand[]> = GameManager.instance.hostTurnSystem.getAllTurnCommands();
		this.clients.forEach(client =>
		{
			if (allTurnCommands.has(client.id))
			{
				//don't get all turn commands, only for the current client.
				const cells: Hex<Cell>[] = [];
				const turnCommands: TurnCommand[] = allTurnCommands.get(client.id);
				turnCommands.forEach(turnCommand =>
				{
					cells.push(turnCommand.turnInformation.targetCell);
				});
				this.renderSelectedCellsOutline(cells, this.getColor(client.color), RenderType.DottedLine);
			}
		});
	}
}
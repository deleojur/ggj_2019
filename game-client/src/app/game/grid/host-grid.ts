import { GridStrategy } from './grid-strategy';
import { HostStateHandler } from '../states/host-states/host-state-handler';
import { GameManager } from '../game-manager';
import { TurnInformation } from '../turns/turn-command';


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
		const allTurnInformation: Map<string, TurnInformation[]> = GameManager.instance.hostTurnSystem.getTurnInformationPerClient();
		this._clients.forEach(client =>
		{
			if (allTurnInformation.has(client.id))
			{
				const turnInformation: TurnInformation[] = allTurnInformation.get(client.id);
				this.renderTurnCommandPath(turnInformation, client.startingPosition, this.getColor(client.color));
			}
		});
	}
}
import { PrimaryState } from '../primary-state';
import { TurnResolveData, TurnInformationData, RequestData, ClientData } from '../request-data';
import { Resource } from '../../entities/resource';
import { ResolveTurnCommand } from '../../turns/resolve-turn-command';
import { ConnectionService } from 'src/services/connection.service';
import { TurnCommand, TurnInformation } from '../../turns/turn-command';
import { GameManager } from '../../game-manager';
import { interval, Subscription, Observable } from 'rxjs';
import { Cell } from '../../grid/grid';
import { Hex } from 'honeycomb-grid';

export interface TurnResolve
{
	faieldCommands: TurnCommand[];
	pendingCommands: TurnCommand[];
	successfulCommands: TurnCommand[];
};

export class hostState_turnResolve extends PrimaryState<RequestData>
{
	private _resolveTurnCommand: ResolveTurnCommand;

	init(connectionService: ConnectionService): void
	{
		super.init(connectionService);

		this._resolveTurnCommand = new ResolveTurnCommand();
	}


	protected subscribeToEvents(): void
    {
        this.connectionService.subscribeToIncomingEvent<RequestData>('client_verify_turnsResolve', 
            (verifyTurnResolve: RequestData) => this.onDataRetrieved(verifyTurnResolve));
	}

	private handleCommands(turnResolve: TurnResolve, turnCommands: TurnCommand[]): TurnCommand[]
	{
		const nextCommands: TurnCommand[] = [];
		turnCommands.forEach(clientCommand =>
		{
			const turnInfo: TurnInformation = clientCommand.turnInformation;
			const otherCommands: TurnInformation[] = GameManager.instance.hostTurnSystem.getTurnInformation(clientCommand.turnInformation.nextCell).slice();
			const indexOf: number = otherCommands.indexOf(turnInfo);
			otherCommands.splice(indexOf, 1);

			GameManager.instance.turnSystem.addExistingCommand(turnInfo.currentCell, clientCommand)
			GameManager.instance.turnSystem.displayTurnCommand(clientCommand, turnInfo.currentCell);
			this._resolveTurnCommand.tryToResolveTurnCommand(clientCommand, otherCommands, turnResolve);
			
			turnInfo.shift();
			if (turnInfo.length > 0)
			{
				nextCommands.push(clientCommand);
			}
		});
		return nextCommands;
	}

	public handleTurns(turnsHandled: () => void): TurnResolve
	{
		const turnResolve: TurnResolve = { faieldCommands: [], pendingCommands: [], successfulCommands: [] };
		let turnCommands: TurnCommand[] = GameManager.instance.hostTurnSystem.getAllTurnCommands();
		let previousCommands: { turnCommand: TurnCommand, hex: Hex<Cell> }[] = []; //temporarily stores the 

		const initialWait: Subscription = interval(5000).subscribe(() => 
		{
			//shave off the first hex; this will not be needed
			turnCommands.forEach(turnCommand =>
			{
				turnCommand.turnInformation.shift();
			});

			const secondaryWait: Subscription = interval(1000).subscribe(() =>
			{
				previousCommands.forEach(command =>
				{
					if (command.turnCommand.turnInformation.length > 0)
					{
						GameManager.instance.turnSystem.removeTurnCommand(command.hex, command.turnCommand);
					}
				});

				previousCommands = [];
				turnCommands.forEach(turnCommand =>
				{
					previousCommands.push({ turnCommand: turnCommand, hex: turnCommand.turnInformation.currentCell });
				});
				turnCommands = this.handleCommands(turnResolve, turnCommands);
				if (turnCommands.length === 0)
				{
					secondaryWait.unsubscribe();
					return turnsHandled();
				}
			});
			initialWait.unsubscribe();
		});
		return turnResolve;
/**
 * this._clients.forEach(client =>
{
	turnResolve.doRequestTurnResolve(client.id, this.exportCommands(validTurnCommands), newResources.get(client.id));
});
 */		
	}

	/**
	 * called after the turns are completely resolved.
	 */
	public doRequestTurnResolve(id: string, turnInformation: TurnInformationData, resources: Resource[]): void
                         	{
		const turnResolveData: TurnResolveData = 
		{
			id: id,
			validTurnCommands: turnInformation,
			resources: resources
		};
		this.connectionService.emitOutgoingEvent('host_game_turnsResolve', turnResolveData);
	}
}
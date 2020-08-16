import { PrimaryState } from '../primary-state';
import { TurnResolveData, TurnInformationData, RequestData } from '../request-data';
import { Resource } from '../../entities/resource';
import { TurnCommand, TurnInformation } from '../../turns/turn-command';
import { GameManager } from '../../game-manager';
import { interval, Subscription } from 'rxjs';
import { Cell } from '../../grid/grid';
import { Hex } from 'honeycomb-grid';
import { ResolveTurnCommand } from '../../turns/resolve-turn-command';

export class hostState_turnResolve extends PrimaryState<RequestData>
{
	protected subscribeToEvents(): void
    {
        this.connectionService.subscribeToIncomingEvent<RequestData>('client_verify_turnsResolve', 
            (verifyTurnResolve: RequestData) => this.onDataRetrieved(verifyTurnResolve));
	}

	private handleCommands(resolveTurnCommand: ResolveTurnCommand, pendingTurnCommands: TurnCommand[], resolvedTurnCommands: TurnCommand[]): TurnCommand[]
	{
		const nextCommands: TurnCommand[] = [];
		pendingTurnCommands.forEach(clientCommand =>
		{
			const turnInfo: TurnInformation = clientCommand.turnInformation;
			
			GameManager.instance.turnSystem.addExistingCommand(turnInfo.currentCell, clientCommand)
			GameManager.instance.turnSystem.displayTurnCommandIcon(clientCommand, turnInfo.currentCell);
			if (resolveTurnCommand.tryToResolveTurnCommand(clientCommand))
			{
				turnInfo.shift();
				if (turnInfo.length > 0)
				{
					nextCommands.push(clientCommand);
				} else
				{
					resolvedTurnCommands.push(clientCommand);
				}
			}
		});
		return nextCommands;
	}

	public handleTurns(resolveTurnCommand: ResolveTurnCommand, turnsHandled: (resolvedTurnCommands: TurnCommand[]) => void): void
	{
		const successfulTurnCommands: TurnCommand[] = [];
		let turnCommands: TurnCommand[] = GameManager.instance.hostTurnSystem.getAllTurnCommands();
		let previousCommands: { turnCommand: TurnCommand, hex: Hex<Cell> }[] = []; //temporarily stores the 

		const initialWait: Subscription = interval(500).subscribe(() => 
		{
			//shave off the first hex; this will not be needed
			turnCommands.forEach(turnCommand =>
			{
				turnCommand.turnInformation.shift();
			});

			const secondaryWait: Subscription = interval(2500).subscribe(() =>
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
				turnCommands = this.handleCommands(resolveTurnCommand, turnCommands, successfulTurnCommands);
				if (turnCommands.length === 0)
				{
					secondaryWait.unsubscribe();
					return turnsHandled(successfulTurnCommands);
				}
			});
			initialWait.unsubscribe();
		});
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
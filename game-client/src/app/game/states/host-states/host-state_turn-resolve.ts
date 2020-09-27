import { PrimaryState } from '../primary-state';
import { TurnResolveData, TurnInformationData, RequestData } from '../request-data';
import { Resource } from '../../entities/resource';
import { TurnCommand, TurnInformation } from '../../turns/turn-command';
import { GameManager } from '../../game-manager';
import { interval, Subscription } from 'rxjs';
import { Cell } from '../../grid/grid';
import { Hex } from 'honeycomb-grid';
import { ResolveTurnCommand } from '../../turns/resolve-turn-command';

export interface ResolvedTurnCommand
{
	validMove: boolean;
	behaviorType: string;
	entityGuid: number;	
	clientId: string;
	targetCell: Hex<Cell>;
}

export class hostState_turnResolve extends PrimaryState<RequestData>
{
	protected subscribeToEvents(): void
    {
        this.connectionService.subscribeToIncomingEvent<RequestData>('client_verify_turnsResolve', 
            (verifyTurnResolve: RequestData) => this.onDataRetrieved(verifyTurnResolve));
	}

	private handleCommands(resolveTurnCommand: ResolveTurnCommand, pendingTurnCommands: TurnCommand[], resolvedTurnCommands: Set<TurnCommand>, unresolvedTurnCommands: ResolvedTurnCommand[]): TurnCommand[]
	{
		const nextCommands: TurnCommand[] = [];
		pendingTurnCommands.forEach(clientCommand =>
		{
			const otherCommands: TurnCommand[] = pendingTurnCommands.slice();
			const indexOf: number = otherCommands.indexOf(clientCommand);
			otherCommands.splice(indexOf, 1);
			const resolvedTurnCommand: ResolvedTurnCommand = resolveTurnCommand.tryToResolveTurnCommand(clientCommand, otherCommands);

			if (resolvedTurnCommand.validMove)
			{
				nextCommands.push(clientCommand);
			} else
			{
				unresolvedTurnCommands.push(resolvedTurnCommand);
			}
		});

		for (let i: number = nextCommands.length - 1; i > -1; i--)
		{
			const turnCommand: TurnCommand = nextCommands[i];
			const turnInfo: TurnInformation = turnCommand.turnInformation;

			GameManager.instance.turnSystem.addExistingCommand(turnInfo.currentCell, turnCommand)
			GameManager.instance.turnSystem.displayTurnCommandIcon(turnCommand, turnInfo.currentCell);
			resolvedTurnCommands.add(turnCommand);
			
			turnInfo.shift();
			if (turnInfo.length === 0)
			{
				nextCommands.splice(i, 1);
			}
		}

		return nextCommands;
	}

	public handleTurns(resolveTurnCommand: ResolveTurnCommand, turnsHandled: (successfulTurnCommands: TurnCommand[], unsuccessfulTurnCommands: ResolvedTurnCommand[]) => void): void
	{
		const successfulTurnCommands: Set<TurnCommand> = new Set<TurnCommand>();
		const unsuccessfulTurnCommands: ResolvedTurnCommand[] = [];
		let turnCommands: TurnCommand[] = GameManager.instance.hostTurnSystem.getAllTurnCommands();
		let previousCommands: { turnCommand: TurnCommand, hex: Hex<Cell> }[] = [];

		const initialWait: Subscription = interval(1000).subscribe(() => 
		{
			//shave off the first hex; this will not be needed
			turnCommands.forEach(turnCommand =>
			{
				turnCommand.turnInformation.shift();
			});

			const secondaryWait: Subscription = interval(1500).subscribe(() =>
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
				turnCommands = this.handleCommands(resolveTurnCommand, turnCommands, successfulTurnCommands, unsuccessfulTurnCommands);
				if (turnCommands.length === 0)
				{
					secondaryWait.unsubscribe();
					return turnsHandled(Array.from(successfulTurnCommands), unsuccessfulTurnCommands);
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
import { TurnsSystem } from './turns-system';
import { GameManager } from '../game-manager';
import { clientState_turnInformation } from '../states/client-states/client-state_turn-information';
import { TurnCommand, TurnInformation } from './turn-command';
import { TurnInformationData } from '../states/request-data';
import { Hex } from 'honeycomb-grid';
import { Cell } from '../grid/grid';
import { clientState_endOfTurn } from '../states/client-states/client-state_end-of-turn';

export class ClientTurnSystem extends TurnsSystem
{
	clientStateTurnInformation: clientState_turnInformation;

	public sendSubmitTurn(confirmTurn: boolean): void
	{
		this.clientStateTurnInformation.doRequestConfirmTurn(confirmTurn);
	}

	public onGameStarted(): void
	{
		this.onRoundStarted();
	}

	protected onRoundStarted(): void
	{
		this.clientStateTurnInformation = 
		GameManager.instance.clientStateHandler.activateState(clientState_turnInformation, () =>
		{
			const clientStateEndOfTurn: clientState_endOfTurn = 
			GameManager.instance.clientStateHandler.activateState(clientState_endOfTurn, () =>
			{
				//start a new round.
				this.onRoundStarted();
			}, true) as clientState_endOfTurn;

			clientStateEndOfTurn.doRequestSendTurnInformation(this.exportCommands);
		}, true) as clientState_turnInformation;
	}

	protected onRoundEnded(): void
	{

	}

	public getAllTurnCommands(): TurnCommand[]
	{
		const turnCommands: TurnCommand[] = [];
		const allCommands = Array.from(this._turnCommands.values());
		allCommands.forEach(turnCommandArray =>
		{
			turnCommandArray.forEach(turnCommand =>
			{
				turnCommands.push(turnCommand);
			});
		});
		return turnCommands;
	}

	/**
	 * This function is called when all data is send to the server. When it is called,
	 * the functionCommands map is cleared.
	 */
	private get exportCommands(): TurnInformationData
	{
		const command: TurnInformationData = { turnCommands: [] };
		this._turnCommands.forEach((val: TurnCommand[], key: Hex<Cell>) =>
		{
			if (val.length > 0)
			{				
				command.turnCommands = [];
				val.forEach(turnCommand =>
				{
					const turnInformation: TurnInformation = turnCommand.turnInformation;
					const originCell: Hex<Cell> = turnInformation.originCell;
					const targetCell: Hex<Cell> = turnInformation.targetCell;
					command.turnCommands.push({
						name: turnInformation.behaviorInformation.name,
						originEntityGuid: turnCommand.turnInformation.originEntity.guid, //TODO: entities must be marked, so that they can be shared across host and client by use of JSON.
						targetEntityName: turnCommand.turnInformation.targetEntity.name, //this will be a combination of the entity's name, player id and some form of index.
						originCell: { x: originCell.x, y: originCell.y },
						targetCell: { x: targetCell.x, y: targetCell.y },
						behaviorInformation: turnInformation.behaviorInformation
					});
				});
			}
		});
		return command;
	}
}
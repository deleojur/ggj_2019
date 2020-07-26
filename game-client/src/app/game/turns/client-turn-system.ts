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

	/**
	 * This function is called when all data is send to the server. When it is called,
	 * the functionCommands map is cleared.
	 */
	private get exportCommands(): TurnInformationData[]
	{
		const commands: TurnInformationData[] = [];
		this._turnCommands.forEach((val: TurnCommand[], key: Hex<Cell>) =>
		{
			if (val.length > 0)
			{
				val.forEach(turnCommand =>
				{
					const turnInformation: TurnInformation = turnCommand.turnInformation;
					const originCell: Hex<Cell> = turnInformation.originCell;
					const targetCell: Hex<Cell> = turnInformation.targetCell;
					const command: TurnInformationData = {
						name: turnInformation.behaviorInformation.name,
						originEntity: 'some entity', //TODO: entities must be marked, so that they can be shared across host and client by use of JSON.
						targetEntity: 'some entity', //this will be a combination of the entity's name, player id and some form of index.
						originCell: { x: originCell.x, y: originCell.y },
						targetCell: { x: targetCell.x, y: targetCell.y },
						id: turnCommand.owner
					};
					commands.push(command);
				});
			}
		});
		return commands;
	}
}
import { TurnsSystem } from './turns-system';
import { GameManager } from '../game-manager';
import { clientState_turnInformation } from '../states/client-states/client-state_turn-information';
import { TurnCommand, TurnInformation } from './turn-command';
import { clientState_turnResolve } from '../states/client-states/client-state_turn-resolve';
import { TurnResolveData, RequestData } from '../states/request-data';
import { clientState_advanceToNextTurn } from '../states/client-states/client-state_advance-to-next-turn';
import { Hex } from 'honeycomb-grid';
import { Cell } from '../grid/grid';

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

	private clientResetTurnCommandsRender(): void
	{
		this.resetTurnCommandsRender(turnCommand =>
		{
			if (turnCommand.owner !== GameManager.instance.clientStateHandler.clientId)
			{
				this._renderCommands.push(turnCommand);
			} else
			{
				this.graphics.removeChild(turnCommand.commandIcon);
			}
		});
	}

	protected onRoundStarted(): void
	{
		console.log('round has started!');
		this.clientStateTurnInformation = 
		GameManager.instance.clientStateHandler.activateState(clientState_turnInformation, () =>
		{
			const clientStateTurnResolve: clientState_turnResolve = 
			GameManager.instance.clientStateHandler.activateState(clientState_turnResolve, (turnResolveData: TurnResolveData) =>
			{
				//TODO: clear all the turnCommands and build/destroy/move entities.
				this.removeAllTurnCommands();

				const turnCommands: TurnCommand[] = this.addTurnInformationFromCommanData(turnResolveData.validTurnCommands);
				turnCommands.forEach(turnCommand =>
				{
					this._resolveTurnCommand.solidifyTurnInformation(turnCommand);
				});
				this.clientResetTurnCommandsRender();
				GameManager.instance.renderCellsOutline();

				GameManager.instance.clientStateHandler.activateState(clientState_advanceToNextTurn, (advanceTurn: RequestData) =>
				{
					GameManager.instance.resourceManager.addResource(turnResolveData.resources);
					this.onRoundEnded();
					this.onRoundStarted();
				}, true);

				clientStateTurnResolve.doRequestVerifyTurnResolve();				
			}, true) as clientState_turnResolve;

			const turnCommands: TurnCommand[] = [];
			this._turnCommands.forEach((val, key) => 
			{
				if (val.length > 0)
				{
					val.forEach(turnCommand =>
					{
						turnCommands.push(turnCommand);
					});
				}				
			});
			clientStateTurnResolve.doRequestSendTurnInformation(this.exportCommands(turnCommands));
		}, true) as clientState_turnInformation;
	}

	public addTurnCommand(turnInformation: TurnInformation, owner: string): TurnCommand
	{
		const command: TurnCommand = super.addTurnCommand(turnInformation, owner);
		if (turnInformation.originCell !== turnInformation.targetCell)
		{
			this._turnCommands.get(turnInformation.originCell).push(command);
		}
		return command;
	}

	protected onRoundEnded(): void
	{
		console.log('round has ended!');	
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
}
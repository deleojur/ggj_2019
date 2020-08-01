import { TurnsSystem } from './turns-system';
import { GameManager } from '../game-manager';
import { clientState_turnInformation } from '../states/client-states/client-state_turn-information';
import { TurnCommand, TurnInformation } from './turn-command';
import { clientState_turnResolve } from '../states/client-states/client-state_turn-resolve';
import { TurnResolveData } from '../states/request-data';
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

	//done 1) host: Create the entities.
	//done 2) host: Generate their guid and share this information with the clients
	//done 3) client/host: Put the turncommands of all clients in a temporary map.
	//done 4) client/host: Clear all turn commands.
	//done 5) client: Create turn commands and resolve them.
		//done 5.1) host/client: set the owner of the command.
	//6) client/host: Display turn commands that weren't able to resolve.
	//done 7) client: verify that turn information was resolved.
	//8) host: advance to next turn.
	//9) host: send request to clients to advance to next turn.
	//10) client: advance to next turn.
	//11) client: add resources from upkeep to resource pool.
	protected onRoundStarted(): void
	{
		this.clientStateTurnInformation = 
		GameManager.instance.clientStateHandler.activateState(clientState_turnInformation, () =>
		{
			const clientStateTurnResolve: clientState_turnResolve = 
			GameManager.instance.clientStateHandler.activateState(clientState_turnResolve, (turnResolveData: TurnResolveData) =>
			{
				//TODO: clear all the turnCommands and build/destroy/move entities.
				//Also display the latest turn commands of clients - what have they done in the previous turn?
				const turnCommands: TurnCommand[] = this.addTurnInformationFromCommanData(turnResolveData.validTurnCommands);
				turnCommands.forEach(turnCommand =>
				{
					this._resolveTurnCommand.solidifyTurnInformation(turnCommand);
				});
				this.clientResetTurnCommandsRender();
				GameManager.instance.renderCellsOutline();
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
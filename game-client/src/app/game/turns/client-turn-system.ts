import { TurnsSystem } from './turns-system';
import { GameManager } from '../game-manager';
import { clientState_turnInformation } from '../states/client-states/client-state_turn-information';
import { TurnCommand } from './turn-command';
import { clientState_turnResolve } from '../states/client-states/client-state_turn-resolve';
import { TurnResolveData } from '../states/request-data';

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

	//1) host: Create the entities.
	//2) host: Generate their guid and share this information with the clients
	//3) client/host: Put the turncommands of all clients in a temporary map.
	//4) client: Clear all turn commands.
	//5) client: Create turn commands and resolve them.
	//6) client/host: Display turn commands that weren't able to resolve.
	protected onRoundStarted(): void
	{
		this.clientStateTurnInformation = 
		GameManager.instance.clientStateHandler.activateState(clientState_turnInformation, () =>
		{
			const clientStateEndOfTurn: clientState_turnResolve = 
			GameManager.instance.clientStateHandler.activateState(clientState_turnResolve, (turnResolveData: TurnResolveData) =>
			{
				//TODO: clear all the turnCommands and build/destroy/move entities.
				//Also display the latest turn commands of clients - what have they done in the previous turn?
				this.clearTurnCommands();
				this.addTurnInformationFromCommanData(turnResolveData.validTurnCommands);

				this._turnCommands.forEach((val, key) =>
				{
					val.forEach(turnCommand =>
					{
						this._resolveTurnCommand.solidifyTurnInformation(turnCommand);
					});
				});			
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
			clientStateEndOfTurn.doRequestSendTurnInformation(this.exportCommands(turnCommands));
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
}
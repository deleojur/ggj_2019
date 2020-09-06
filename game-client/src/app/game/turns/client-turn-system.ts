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
				this.iconGraphics.removeChild(turnCommand.commandIcon);
			}
		});
	}

	public previewTurnCommand(turnCommand: TurnCommand): void
	{
		const turnInformation: TurnInformation = turnCommand.turnInformation;
		const type: string = turnInformation.behaviorInformation.type;
		if (type === 'build')
		{
			GameManager.instance.gridStrategy.addEntity(turnInformation.targetCell, turnInformation.targetEntity);
		}
		else if (type === 'move')
		{
			GameManager.instance.gridStrategy.moveEntityToHex(turnInformation.originEntity, turnInformation.currentCell, turnInformation.targetCell);
		}
	}

	private removeTurnCommands(): void
	{
		const tiles: Hex<Cell>[] = GameManager.instance.grid.getValidTiles();
		tiles.forEach((hex: Hex<Cell>) => 
		{
			const turnCommands: TurnCommand[] = this._turnCommands.get(hex);
			turnCommands.forEach(turnCommand =>
			{
				const type: string = turnCommand.turnInformation.behaviorInformation.type;
				const turnInformation: TurnInformation = turnCommand.turnInformation;
				this.removeTurnCommand(hex, turnCommand);

				if (type === 'build')
				{
					GameManager.instance.gridStrategy.removeEntity(turnCommand.turnInformation.targetCell, turnCommand.turnInformation.targetEntity);
				}

				if (type === 'move')
				{
					GameManager.instance.gridStrategy.moveEntityToHex(turnInformation.targetEntity, turnInformation.targetCell, turnInformation.originCell);
				}
			});
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
				this.removeTurnCommands();

				const turnCommands: TurnCommand[] = this.addTurnInformationFromCommandData(turnResolveData.validTurnCommands);
				turnCommands.forEach(turnCommand =>
				{
					const turnInformation: TurnInformation = turnCommand.turnInformation;
					this._resolveTurnCommand.resolveTurnCommand(turnCommand, turnInformation.targetCell, turnInformation.originCell);
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
			clientStateTurnResolve.doRequestSendTurnInformation(this.exportCommands(turnCommands, (turnCommand: TurnInformation) => { return turnCommand.fullPathData }));
		}, true) as clientState_turnInformation;
	}

	public addTurnCommand(turnInformation: TurnInformation, hex: Hex<Cell>, owner: string): TurnCommand
	{
		const command: TurnCommand = super.addTurnCommand(turnInformation, hex, owner);
		this.displayTurnCommandIcon(command, turnInformation.targetCell);
		if (turnInformation.currentCell !== turnInformation.targetCell)
		{
			this._turnCommands.get(turnInformation.currentCell).push(command);
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

	public getAllTurnInformation(): TurnInformation[]
	{
		const turnCommands: TurnCommand[] = this.getAllTurnCommands();
		const turnInformation: TurnInformation[] = [];

		turnCommands.forEach(turnCommand =>
		{
			turnInformation.push(turnCommand.turnInformation);
		});

		return turnInformation;
	}
}
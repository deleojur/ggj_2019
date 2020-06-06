import { TurnCommand, TurnInformation } from 'src/app/game/turns/turn-command';
import { Hex, Point } from 'honeycomb-grid';
import { Cell } from 'src/app/game/grid/grid';
import { ViewportManager } from '../render/viewport';
import { Point as pPoint } from 'pixi.js';

export class TurnsSystem
{
	private _turnCommands: Map<Hex<Cell>, TurnCommand> = new Map<Hex<Cell>, TurnCommand>();
	
	constructor(private viewport: ViewportManager)
	{
		
	}

	public getTurnInformation(hex: Hex<Cell>): TurnInformation
	{
		if (this._turnCommands.has(hex))
		{
			return this._turnCommands.get(hex).turnInformation;
		}
		return null;
	}

	public addTurnCommand(turnInformation: TurnInformation): void
	{
		const command: TurnCommand = new TurnCommand('someone', turnInformation);
		const hex: Hex<Cell> = turnInformation.targetCell;
		const pos: Point = hex.toPoint().add(hex.center());
		const scale: pPoint = new pPoint(0.5, 0.5);
		command.position = new pPoint(pos.x, pos.y - 50);
		command.scale = scale;
		command.anchor = new pPoint(0.5, 0.5);

		this._turnCommands.set(turnInformation.targetCell, command);
		this._turnCommands.set(turnInformation.originCell, command);
		this.viewport.addChild(command);
	}

	public removeTurnCommand(hex: Hex<Cell>): TurnInformation
	{
		const turnCommand: TurnCommand = this._turnCommands.get(hex);
		const origin: Hex<Cell> = turnCommand.turnInformation.originCell;
		const target: Hex<Cell> = turnCommand.turnInformation.targetCell;

		const targetCommand: TurnCommand = this._turnCommands.get(target);
		this._turnCommands.delete(origin);
		this._turnCommands.delete(target);

		this.viewport.removeChild(targetCommand);

		return targetCommand.turnInformation;
	}

	/**
	 * This function is called when all data is send to the server. When it is called,
	 * the functionCommands map is cleared. 
	 */
	public get exportCommands(): TurnCommand[]
	{
		const turnCommands: TurnCommand[] = Array.from(this._turnCommands.values());
		this._turnCommands.clear();
		return turnCommands;
	}

	public set importCommands(commands: TurnCommand[])
	{
		commands.forEach(e => 
		{
			this._turnCommands.set(e.turnInformation.originCell, e);
		});
	}
}
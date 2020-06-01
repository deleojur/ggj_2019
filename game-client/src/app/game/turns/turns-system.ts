import { TurnCommand, TurnInformation } from 'src/app/game/turns/turn-command';
import { Hex } from 'honeycomb-grid';
import { Cell } from 'src/app/game/grid/grid';
import { ViewportManager } from '../render/viewport';

export class TurnsSystem
{
	private _turnCommands: Map<Hex<Cell>, TurnCommand> = new Map<Hex<Cell>, TurnCommand>();
	
	constructor(private _viewport: ViewportManager)
	{
		
	}

	public addTurnCommand(command: TurnInformation): void
	{
		//this._turnCommands.set(command.turnInformation.originCell, command);
		//this._viewport.addChild(command);
	}

	public removeTurnCommand(command: TurnCommand): void
	{
		this.removeTurnCommandByOrigin(command.turnInformation.originCell);
		this._viewport.removeChild(command);
	}

	public removeTurnCommandByOrigin(origin: Hex<Cell>): void
	{
		this._turnCommands.delete(origin);
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
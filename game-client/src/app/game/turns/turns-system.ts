import { TurnCommand } from 'src/app/game/turns/turn-command';
import { Hex } from 'honeycomb-grid';
import { Cell } from 'src/app/game/grid/grid';
import { GameService } from '../../../services/game.service';
import { Loader, Texture } from 'pixi.js';

export class TurnsSystem
{
	private _turnCommands: Map<Hex<Cell>, TurnCommand> = new Map<Hex<Cell>, TurnCommand>();
	private _textures: Map<string, Texture> = new Map<string, Texture>();

	constructor(private gameService: GameService) 
	{
		
	}

	public async loadIconTextures(): Promise<void>
	{
		return new Promise(resolve => 
		{
			const loader: Loader = new Loader();
			const actionsUrl: string = 'assets/actions/actions.json';

			loader.add(actionsUrl);
			loader.load((loader, resources) =>
			{
				const actionProperties: any[] = resources[actionsUrl].data as any[];
				loader.reset();

				actionProperties.forEach(e =>
				{
					loader.add(e.textureUrl);
				});

				loader.load((loader, resources) =>
				{
					actionProperties.forEach(e => 
					{
						const texture: Texture = Texture.from(resources.data[e.textureUrl]);
						this._textures.set(e.name, texture);
					});					
				});
				resolve();
			});			
		});
	}

	public addTurnCommand(command: TurnCommand): void
	{
		this._turnCommands.set(command.origin, command);
	}

	public removeTurnCommand(command: TurnCommand): void
	{
		this.removeTurnCommandByOrigin(command.origin);
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
			this._turnCommands.set(e.origin, e);
		});
	}
}
import { TurnCommand, TurnInformation } from 'src/app/game/turns/turn-command';
import { Hex, Point } from 'honeycomb-grid';
import { Cell } from 'src/app/game/grid/grid';
import { Point as pPoint, Graphics } from 'pixi.js';
import { GameManager } from '../game-manager';
import { BehaviorInformation, Entity } from '../entities/entity';

interface EntityTypes
{
	originEntity: Entity;
	targetEntity: Entity;
}

export class TurnsSystem
{
	

	private _turnCommands: Map<Hex<Cell>, TurnCommand[]> = new Map<Hex<Cell>, TurnCommand[]>();
	private _commandIconPositions: pPoint[][] = [[], [new pPoint(0, -75)], [new pPoint(-62, -50), new pPoint(62, -50)]];
	
	constructor(private graphics: Graphics)
	{
		const tiles: Hex<Cell>[] = GameManager.instance.grid.getValidTiles();
		tiles.forEach((e: Hex<Cell>) => 
		{
			//add an empty commandlist for every valid tile.
			this._turnCommands.set(e, []);
		});
	}

	public getBehaviorInformation(hex: Hex<Cell>): BehaviorInformation[]
	{
		const turnInformationArray: TurnInformation[] = this.getTurnInformation(hex);
		if (turnInformationArray.length > 0)
		{
			const behaviorInformation: BehaviorInformation[] = [];
			turnInformationArray.forEach(turnInformation =>
			{
				turnInformation.behaviorInformation.entity = turnInformation.targetEntity;

				behaviorInformation.push(turnInformation.behaviorInformation);
			});
			return behaviorInformation;
		} 
		return [];
	}

	public getTurnInformation(hex: Hex<Cell>): TurnInformation[]
	{
		if (this._turnCommands.has(hex))
		{
			const turnCommand: TurnCommand[] = this._turnCommands.get(hex);
			const turnInformation: TurnInformation[] = [];
			turnCommand.forEach(e =>
			{
				turnInformation.push(e.turnInformation);
			});
			return turnInformation;
		}
		return [];
	}

	private createTargetEntity(entity: Entity, hex: Hex<Cell>, item: BehaviorInformation): Entity
	{
		switch (item.type)
		{
			case "upgrade":
			case "build":
			case "train":
				return GameManager.instance.grid.createEntity(hex, 'someone', item.creates);
			case "move":
				return entity;
		}
	}

	public generateTurnInformation(
		originCell: Hex<Cell>,
		targetCell: Hex<Cell>,
		entity: Entity,
		item: BehaviorInformation): TurnInformation
	{
		const targetEntity: Entity = this.createTargetEntity(entity, targetCell, item);
		return {
			originCell: originCell,
			targetCell: targetCell,
			originEntity: entity,
			targetEntity: targetEntity,
			behaviorInformation: item
		};
	}

	public addTurnCommand(turnInformation: TurnInformation): void
	{
		const command: TurnCommand = new TurnCommand('someone', turnInformation);
		this._turnCommands.get(turnInformation.targetCell).push(command);
		if (turnInformation.originCell !== turnInformation.targetCell)
		{
			this._turnCommands.get(turnInformation.originCell).push(command);
		}

		if (turnInformation.originEntity === null)
		{
			//destroy that entity.
		}

		if (turnInformation.targetEntity !== null)
		{
			//create that entity.
		}

		if (turnInformation.behaviorInformation.type === 'move')
		{
			//move that entity.
			GameManager.instance.grid.moveEntityToHex(turnInformation.targetCell, turnInformation.targetEntity);
		}

		this.graphics.addChild(command.commandIcon);		
		this.addCommandIcon(turnInformation.targetCell);
	}

	private addCommandIcon(hex: Hex<Cell>): void
	{
		const pos: Point = hex.toPoint().add(hex.center());
		const length: number = this._turnCommands.get(hex).length;
		for (let i: number = 0; i < length; i++)
		{
			const turnCommand: TurnCommand = this._turnCommands.get(hex)[i];
			const localPos: pPoint = this._commandIconPositions[length][i];
			turnCommand.commandIcon.position = new pPoint(pos.x + localPos.x, pos.y + localPos.y);
		}
	}

	public removeTurnCommand(hex: Hex<Cell>, behaviorInformation: BehaviorInformation): TurnInformation
	{
		const turnCommands: TurnCommand[] = this._turnCommands.get(hex);
		for (let i: number = 0; i < turnCommands.length; i++)
		{
			const turnCommand: TurnCommand = turnCommands[i];
			if (behaviorInformation === turnCommand.turnInformation.behaviorInformation)
			{
				const origin: Hex<Cell> = turnCommand.turnInformation.originCell;
				const target: Hex<Cell> = turnCommand.turnInformation.targetCell;

				const originIndex: number = this._turnCommands.get(origin).indexOf(turnCommand);
				const targetIndex: number = this._turnCommands.get(target).indexOf(turnCommand);

				this._turnCommands.get(origin).splice(originIndex, 1);
				this._turnCommands.get(target).splice(targetIndex, 1);

				this.graphics.removeChild(turnCommand.commandIcon);
				return turnCommand.turnInformation;
			}
		}
	}

	/**
	 * This function is called when all data is send to the server. When it is called,
	 * the functionCommands map is cleared. 
	 */
	public get exportCommands(): TurnCommand[][]
	{
		const turnCommands: TurnCommand[][] = Array.from(this._turnCommands.values());
		this._turnCommands.clear();
		return turnCommands;
	}

	public set importCommands(commands: TurnCommand[])
	{
		commands.forEach(e => 
		{
			//this._turnCommands.set(e.turnInformation.originCell, e);
		});
	}
}
import { TurnCommand, TurnInformation } from 'src/app/game/turns/turn-command';
import { Hex, Point } from 'honeycomb-grid';
import { Cell } from 'src/app/game/grid/grid';
import { Point as pPoint, Graphics } from 'pixi.js';
import { GameManager } from '../game-manager';
import { BehaviorInformation, Entity } from '../entities/entity';
import { TurnInformationData, TurnCommandData } from '../states/request-data';
import { ResolveTurnCommand } from './resolve-turn-command';
import { AssetLoader } from 'src/app/asset-loader';

export abstract class TurnsSystem
{
	protected _resolveTurnCommand: ResolveTurnCommand;
	protected _turnCommands: Map<Hex<Cell>, TurnCommand[]>;
	protected _renderCommands: TurnCommand[];

	private _commandIconPositions: pPoint[][] = [[], [new pPoint(0, -75)], [new pPoint(-62, -50), new pPoint(62, -50)]];
	protected graphics: Graphics;

	public init(graphics: Graphics): void
	{
		this.graphics = graphics;
		this._turnCommands = new Map<Hex<Cell>, TurnCommand[]>();
		this._renderCommands = [];
		this._resolveTurnCommand = new ResolveTurnCommand();
		
		const tiles: Hex<Cell>[] = GameManager.instance.grid.getValidTiles();
		tiles.forEach((e: Hex<Cell>) => 
		{
			this._turnCommands.set(e, []);
		});
	}

	public abstract onGameStarted(): void;
	protected abstract onRoundStarted(): void;
	protected abstract onRoundEnded(): void;

	protected removeRenderCommands(): void
	{
		this._renderCommands.forEach(command =>
		{
			this.graphics.removeChild(command.commandIcon);
		});
		this._renderCommands = [];
	}

	protected resetTurnCommandsRender(forEachTurnCommand: (turnCommand: TurnCommand) => void): void
	{
		this.removeRenderCommands();
		const tiles: Hex<Cell>[] = GameManager.instance.grid.getValidTiles();
		tiles.forEach((e: Hex<Cell>) => 
		{
			const turnCommands: TurnCommand[] = this._turnCommands.get(e);
			turnCommands.forEach(turnCommand =>
			{
				forEachTurnCommand(turnCommand);
			});
			this._turnCommands.set(e, []);
		});
	}

	protected removeAllTurnCommands(): void
	{
		const tiles: Hex<Cell>[] = GameManager.instance.grid.getValidTiles();
		tiles.forEach((e: Hex<Cell>) => 
		{
			const turnCommands: TurnCommand[] = this._turnCommands.get(e);
			turnCommands.forEach(turnCommand =>
			{
				GameManager.instance.gridStrategy.removeEntity(turnCommand.turnInformation.targetCell, turnCommand.turnInformation.targetEntity);
			});
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

	private createTargetEntity(originEntity: Entity, hex: Hex<Cell>, item: BehaviorInformation): Entity
	{		
		switch (item.type)
		{
			case "upgrade":
			case "build":
			case "train":
				return GameManager.instance.gridStrategy.createEntity(hex, 'new entity -> no owner has been set yet.', item.creates);
			case "move":
				return originEntity;
		}
	}

	public addTurnInformationFromCommanData(turnInformationData: TurnInformationData): TurnCommand[]
	{
		const turnCommands: TurnCommand[] = [];
		turnInformationData.turnCommands.forEach(command => 
		{
			const originCell: Hex<Cell> = GameManager.instance.grid.getHex(command.originCell.x, command.originCell.y);
			const targetCell: Hex<Cell> = GameManager.instance.grid.getHex(command.targetCell.x, command.targetCell.y);
			const entity: Entity = GameManager.instance.gridStrategy.getEntityByGuid(command.originEntityGuid);
			const behaviorInformation: BehaviorInformation = AssetLoader.instance.getBehaviorInformation(command.behaviorInformation);
			const turnInformation: TurnInformation = this.generateTurnInformation(originCell, targetCell, entity, behaviorInformation);
			const turnCommand: TurnCommand = this.addTurnCommand(turnInformation, command.owner);
			turnCommand.turnInformation.targetEntity.guid = command.targetEntityGuid;
			turnCommands.push(turnCommand);
		});
		return turnCommands;
	}

	public generateTurnInformation(
		originCell: Hex<Cell>,
		targetCell: Hex<Cell>,
		originEntity: Entity,
		item?: BehaviorInformation): TurnInformation
	{
		const targetEntity: Entity = this.createTargetEntity(originEntity, targetCell, item);
		return {
			originCell: originCell,
			targetCell: targetCell,
			originEntity: originEntity,
			targetEntity: targetEntity,
			behaviorInformation: item
		};
	}

	public addTurnCommand(turnInformation: TurnInformation, owner: string): TurnCommand
	{
		const command: TurnCommand = new TurnCommand(owner, turnInformation);
		this._turnCommands.get(turnInformation.targetCell).push(command);

		if (turnInformation.behaviorInformation.type === 'upgrade')
		{
			GameManager.instance.gridStrategy.removeEntity(turnInformation.originCell, turnInformation.originEntity);
		}

		if (turnInformation.behaviorInformation.type === 'move')
		{
			GameManager.instance.gridStrategy.moveEntityToHex(turnInformation.targetEntity, turnInformation.originCell, turnInformation.targetCell);
		}

		this.graphics.addChild(command.commandIcon);
		this.updateCommandIcons(turnInformation.targetCell);

		return command;
	}

	private updateCommandIcons(hex: Hex<Cell>): void
	{
		const pos: Point = hex.toPoint().add(hex.center());
		const turnCommands: TurnCommand[] = this._turnCommands.get(hex).slice();

		for (let i: number = turnCommands.length - 1; i > -1; i--)
		{
			const command: TurnCommand = turnCommands[i];
			if (command.turnInformation.targetCell !== hex)
			{
				turnCommands.splice(i, 1);
			}
		}

		for (let i: number = 0; i < turnCommands.length; i++)
		{
			const command: TurnCommand = turnCommands[i];
			const localPos: pPoint = this._commandIconPositions[turnCommands.length][i];
			command.commandIcon.position = new pPoint(pos.x + localPos.x, pos.y + localPos.y);
		}
	}

	private reverseTurnCommand(turnInformation: TurnInformation): void
	{
		const behaviorInformation: BehaviorInformation = turnInformation.behaviorInformation;
		switch (behaviorInformation.type)
		{
			case 'upgrade':
			case 'train':
				GameManager.instance.gridStrategy.addEntity(turnInformation.originCell, turnInformation.originEntity);
				GameManager.instance.gridStrategy.removeEntity(turnInformation.targetCell, turnInformation.targetEntity);
				break;
			case 'build':
				GameManager.instance.gridStrategy.removeEntity(turnInformation.targetCell, turnInformation.targetEntity);
				break;
			case 'move':
				GameManager.instance.gridStrategy.moveEntityToHex(turnInformation.originEntity, turnInformation.targetCell, turnInformation.originCell);
				break;
		}
	}

	public removeTurnCommand(hex: Hex<Cell>, behaviorInformation: BehaviorInformation): TurnInformation
	{
		const turnCommands: TurnCommand[] = this._turnCommands.get(hex);
		for (let i: number = 0; i < turnCommands.length; i++)
		{
			const turnCommand: TurnCommand = turnCommands[i];
			const turnInformation: TurnInformation = turnCommand.turnInformation;
			if (behaviorInformation === turnCommand.turnInformation.behaviorInformation)
			{
				const origin: Hex<Cell> = turnInformation.originCell;
				const target: Hex<Cell> = turnInformation.targetCell;

				const originIndex: number = this._turnCommands.get(origin).indexOf(turnCommand);
				const targetIndex: number = this._turnCommands.get(target).indexOf(turnCommand);

				this._turnCommands.get(target).splice(targetIndex, 1);

				if (target !== origin)
				{
					this._turnCommands.get(origin).splice(originIndex, 1);
				}

				this.reverseTurnCommand(turnInformation);

				this.graphics.removeChild(turnCommand.commandIcon);

				this.updateCommandIcons(hex);
				return turnCommand.turnInformation;
			}
		}
	}

	protected exportCommands(turnCommands: TurnCommand[]): TurnInformationData
	{
		const turnInformationData: TurnInformationData = { turnCommands: [] };
		turnCommands.forEach(turnCommand =>
		{
			const turnInformation: TurnInformation = turnCommand.turnInformation;
			const originCell: Hex<Cell> = turnInformation.originCell;
			const targetCell: Hex<Cell> = turnInformation.targetCell;
			const guid: number = turnCommand.turnInformation.originEntity.guid;
			let isPresent: boolean = false;

			for (let i: number = 0; i < turnInformationData.turnCommands.length; i++)
			{
				const turnCommand: TurnCommandData = turnInformationData.turnCommands[i];
				if (turnCommand.originEntityGuid === guid)
				{
					isPresent = true;
					break;
				}
			}

			if (!isPresent)
			{
				turnInformationData.turnCommands.push(
				{
					owner: turnCommand.owner,
					name: turnInformation.behaviorInformation.name,
					originEntityGuid: turnCommand.turnInformation.originEntity.guid,
					targetEntityName: turnCommand.turnInformation.targetEntity.name,
					targetEntityGuid: turnCommand.turnInformation.targetEntity.guid,
					originCell: { x: originCell.x, y: originCell.y },
					targetCell: { x: targetCell.x, y: targetCell.y },
					behaviorInformation: turnInformation.behaviorInformation.name,
				});
			}
		});
		return turnInformationData;
	}
}
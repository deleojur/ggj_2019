import { TurnCommand, TurnInformation } from 'src/app/game/turns/turn-command';
import { Hex, Point } from 'honeycomb-grid';
import { Cell } from 'src/app/game/grid/grid';
import { Point as pPoint, Graphics } from 'pixi.js';
import { GameManager } from '../game-manager';
import { BehaviorInformation, Entity } from '../entities/entity';
import { TurnInformationData, TurnCommandData, PositionData } from '../states/request-data';
import { AssetLoader } from 'src/app/asset-loader';
import { GridStrategy } from '../grid/grid-strategy';
import { ResolveTurnCommand } from './resolve-turn-command';

export abstract class TurnsSystem
{
	protected _resolveTurnCommand: ResolveTurnCommand;
	protected _turnCommands: Map<Hex<Cell>, TurnCommand[]>;
	protected _renderCommands: TurnCommand[];

	private _commandIconPositions: pPoint[][] = [[], [new pPoint(0, -75)], [new pPoint(-62, -50), new pPoint(62, -50)]];
	protected iconGraphics: Graphics;

	public init(graphics: Graphics): void
	{
		this.iconGraphics = new Graphics();
		graphics.addChild(this.iconGraphics);

		this._turnCommands = new Map<Hex<Cell>, TurnCommand[]>();
		this._renderCommands = [];
		this.resetTurnCommands();
		this._resolveTurnCommand = new ResolveTurnCommand();
	}

	protected resetTurnCommands(): void
	{
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
			this.iconGraphics.removeChild(command.commandIcon);
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
		const gridStrategy: GridStrategy = GameManager.instance.gridStrategy;
		switch (item.type)
		{
			case "build":
			case "upgrade":
			case "train":
				const entity_t: Entity = gridStrategy.createEntity(hex, 'new entity -> no owner has been set yet.', item.creates);
				return entity_t;
			case "move":
				return originEntity;
		}
	}

	public addTurnInformationFromCommandData(turnInformationData: TurnInformationData): TurnCommand[]
	{
		const turnCommands: TurnCommand[] = [];

		turnInformationData.turnCommands.forEach(command => 
		{
			const path: Hex<Cell>[] = [];
			command.path.forEach(position =>
			{
				const hex: Hex<Cell> = GameManager.instance.grid.getHex(position.x, position.y);
				path.push(hex);
			});
			const originEntity: Entity = GameManager.instance.gridStrategy.getEntityByGuid(command.originEntityGuid);
			const behaviorInformation: BehaviorInformation = AssetLoader.instance.getBehaviorInformation(command.behaviorInformation);
			const turnInformation: TurnInformation = this.generateTurnInformation(originEntity, behaviorInformation, path);
			const turnCommand: TurnCommand = this.addTurnCommand(turnInformation, turnInformation.targetCell, command.owner);
			GameManager.instance.gridStrategy.setEntityGuid(turnCommand.turnInformation.targetEntity, command.targetEntityGuid);
			turnCommands.push(turnCommand);
		});
		return turnCommands;
	}

	public generateTurnInformation(
		originEntity: Entity,
		item?: BehaviorInformation,
		path?: Hex<Cell>[]): TurnInformation
	{
		const targetCell: Hex<Cell> = path[path.length - 1];
		const targetEntity: Entity = this.createTargetEntity(originEntity, targetCell, item);
		const turnInformation: TurnInformation = new TurnInformation(item, originEntity, targetEntity, path);
		return turnInformation;
	}

	public displayTurnCommandIcon(command: TurnCommand, target: Hex<Cell>): void
	{
		this.iconGraphics.addChild(command.commandIcon);
		this.updateCommandIcons(target);
	}

	public addExistingCommand(hex: Hex<Cell>, turnCommand: TurnCommand): void
	{
		this._turnCommands.get(hex).push(turnCommand);
	}

	public addTurnCommand(turnInformation: TurnInformation, hex: Hex<Cell>, owner: string): TurnCommand
	{
		const command: TurnCommand = new TurnCommand(owner, turnInformation);
		this._turnCommands.get(hex).push(command);
		return command;
	}

	private updateCommandIcons(hex: Hex<Cell>): void
	{
		const pos: Point = hex.toPoint().add(hex.center());
		const turnCommands: TurnCommand[] = this._turnCommands.get(hex).slice();

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
				GameManager.instance.gridStrategy.addEntity(turnInformation.currentCell, turnInformation.originEntity);
				GameManager.instance.gridStrategy.removeEntity(turnInformation.targetCell, turnInformation.targetEntity);
				break;
			case 'build':
				GameManager.instance.gridStrategy.removeEntity(turnInformation.targetCell, turnInformation.targetEntity);
				break;
			case 'move':
				GameManager.instance.gridStrategy.moveEntityToHex(turnInformation.originEntity, turnInformation.targetCell, turnInformation.currentCell);
				break;
		}
	}

	public removeTurnCommand(hex: Hex<Cell>, turnCommand: TurnCommand): void
	{
		const turnCommands: TurnCommand[] = this._turnCommands.get(hex);

		for (let i: number = turnCommands.length - 1; i > -1; i--)
		{
			if (turnCommand.turnInformation.originEntity === turnCommands[i].turnInformation.originEntity)
			{
				turnCommands.splice(i, 1);
				this._turnCommands.set(hex, turnCommands);
				this.iconGraphics.removeChild(turnCommand.commandIcon);	
			}
		}
		this.updateCommandIcons(hex);
	}

	public removeBehaviorInformation(hex: Hex<Cell>, behaviorInformation: BehaviorInformation): TurnInformation
	{
		const turnCommands: TurnCommand[] = this._turnCommands.get(hex);
		for (let i: number = 0; i < turnCommands.length; i++)
		{
			const turnCommand: TurnCommand = turnCommands[i];
			const turnInformation: TurnInformation = turnCommand.turnInformation;
			if (behaviorInformation === turnCommand.turnInformation.behaviorInformation)
			{
				const origin: Hex<Cell> = turnInformation.currentCell;
				const target: Hex<Cell> = turnInformation.targetCell;

				const originIndex: number = this._turnCommands.get(origin).indexOf(turnCommand);
				const targetIndex: number = this._turnCommands.get(target).indexOf(turnCommand);

				this._turnCommands.get(target).splice(targetIndex, 1);

				if (target !== origin)
				{
					this._turnCommands.get(origin).splice(originIndex, 1);
				}

				this.reverseTurnCommand(turnInformation);

				this.iconGraphics.removeChild(turnCommand.commandIcon);

				this.updateCommandIcons(hex);
				return turnCommand.turnInformation;
			}
		}
	}

	public exportCommands(turnCommands: TurnCommand[], getTurnCommandPath: (turnInformation: TurnInformation) => PositionData[]): TurnInformationData
	{
		const turnInformationData: TurnInformationData = { turnCommands: [] };
		turnCommands.forEach(turnCommand =>
		{
			const turnInformation: TurnInformation = turnCommand.turnInformation;
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
			const path: PositionData[] = getTurnCommandPath(turnInformation);

			if (!isPresent)
			{
				turnInformationData.turnCommands.push(
				{
					owner: turnCommand.owner,
					name: turnInformation.behaviorInformation.name,
					originEntityGuid: turnCommand.turnInformation.originEntity.guid,
					targetEntityName: turnCommand.turnInformation.targetEntity.name,
					targetEntityGuid: turnCommand.turnInformation.targetEntity.guid,
					behaviorInformation: turnInformation.behaviorInformation.name,
					path: path
				});
			}
		});
		return turnInformationData;
	}
}
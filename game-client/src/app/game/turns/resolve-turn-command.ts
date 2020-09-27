import { TurnInformation, TurnCommand } from './turn-command';
import { GameManager } from '../game-manager';
import { Hex } from 'honeycomb-grid';
import { Cell } from '../grid/grid';
import { Entity } from '../entities/entity';
import { Unit } from '../entities/unit';
import { Structure } from '../entities/structure';
import { ResolvedTurnCommand } from '../states/host-states/host-state_turn-resolve';

export class ResolveTurnCommand
{
	public tryToResolveTurnCommand(turnCommand: TurnCommand, otherCommands: TurnCommand[]): ResolvedTurnCommand
	{
		const turnInformation: TurnInformation = turnCommand.turnInformation;
		const type: string = turnInformation.behaviorInformation.type;
		const entities: Entity[] = this.getEntitiesWithoutCommands(turnCommand, otherCommands);		
		let validMove: boolean = false;

		if (type === 'move')
		{
			validMove = this.tryResolveMoveTurn(turnCommand, otherCommands, entities);
		} else if (type === 'build')
		{
			validMove = this.tryResolveBuildTurn(turnCommand, otherCommands, entities);
		} else if (type === 'train' || type === 'upgrade')
		{
			this.resolveTurnCommand(turnCommand, turnInformation.targetCell, turnInformation.originCell);
			//TODO: a unit cannot be trained when another unit is occupying this structure.
			//TODO: a town cannot upgrade when a unit is occupying that town.
			validMove = true;
		}
		const resolvedTurnCommand: ResolvedTurnCommand = {
			clientId: turnCommand.owner,
			behaviorType: type,
			entityGuid: turnInformation.targetEntity.guid,
			targetCell: turnInformation.currentCell,
			validMove: validMove
		};
		return resolvedTurnCommand;
	}

	private tryResolveMoveTurn(turnCommand: TurnCommand, otherCommands: TurnCommand[], entities: Entity[]): boolean
	{
		const turnInformation: TurnInformation = turnCommand.turnInformation;
		let canMove: boolean = true;
		otherCommands.forEach(otherCommand =>
		{
			const otherTurnInformation: TurnInformation = otherCommand.turnInformation;
			if (otherTurnInformation.behaviorInformation.type === 'move')
			{
				if ((otherTurnInformation.currentCell === turnInformation.currentCell) || //landing on the same cell
					(otherTurnInformation.currentCell === turnInformation.previousCell && //moving past each other
					otherTurnInformation.previousCell === turnInformation.currentCell))
				{
					canMove = false;
				}
			}
		});

		entities.forEach(entity => 
		{
			if (entity instanceof Unit)
			{
				canMove = false;
			}
		});

		if (canMove)
		{
			this.resolveTurnCommand(turnCommand, turnInformation.currentCell, turnInformation.previousCell);
		}
		return canMove;
	}

	private tryResolveBuildTurn(turnCommand: TurnCommand, otherCommands: TurnCommand[], entities: Entity[]): boolean
	{
		const turnInformation: TurnInformation = turnCommand.turnInformation;
		for (let i = 0; i < otherCommands.length; i++)
		{
			const otherTurnInformation: TurnInformation = otherCommands[i].turnInformation;
			if (otherTurnInformation.behaviorInformation.type === 'build')
			{
				if (otherTurnInformation.currentCell === turnInformation.currentCell) //building on the same cell
				{
					return false;
				}
			}
		}

		for (let i = 0; i < entities.length; i++)
		{
			if (entities[i] instanceof Structure)
			{
				return false;
			}
		}
		this.resolveTurnCommand(turnCommand, turnInformation.currentCell, turnInformation.previousCell);
		return true;
	}

	private getEntitiesWithoutCommands(turnCommand: TurnCommand, otherCommands: TurnCommand[]): Entity[]
	{
		const entities: Entity[] = GameManager.instance.gridStrategy.getEntitiesAtHex(turnCommand.turnInformation.currentCell).slice();
		
		for (let i: number = entities.length - 1; i > -1; i--)
		{
			const entity: Entity = entities[i];
			const allCommands: TurnCommand[] = [turnCommand, ...otherCommands];

			allCommands.forEach(command =>
			{
				if (entity === command.turnInformation.targetEntity)
				{
					entities.splice(i, 1);
				}
			});			
		}
		return entities;
	}

	public resolveTurnCommand(turnCommand: TurnCommand, targetCell: Hex<Cell>, originCell: Hex<Cell>): void
	{
		const turnInformation: TurnInformation = turnCommand.turnInformation;
		turnInformation.targetEntity = GameManager.instance.gridStrategy.createEntityFromCommand(turnCommand);
		const type: string = turnInformation.behaviorInformation.type;

		if (type === 'train' || type === 'upgrade' || type === 'build')
		{
			GameManager.instance.gridStrategy.addEntity(targetCell, turnInformation.targetEntity);
			if (type === 'upgrade')
			{
				GameManager.instance.gridStrategy.removeEntity(targetCell, turnInformation.originEntity);
			}
		}

		if (type === 'move')
		{
			GameManager.instance.gridStrategy.moveEntityToHex(turnInformation.targetEntity, originCell, targetCell);
		}
	}
}
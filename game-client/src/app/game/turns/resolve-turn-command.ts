import { TurnInformation, TurnCommand } from './turn-command';
import { GameManager } from '../game-manager';
import { Hex } from 'honeycomb-grid';
import { Cell } from '../grid/grid';
import { Entity } from '../entities/entity';
import { Unit } from '../entities/unit';
import { Structure } from '../entities/structure';

export class ResolveTurnCommand
{
	public tryToResolveTurnCommand(turnCommand: TurnCommand, otherCommands: TurnCommand[]): boolean
	{
		const turnInformation: TurnInformation = turnCommand.turnInformation;
		const type: string = turnInformation.behaviorInformation.type;
		const entities: Entity[] = this.getEntitiesWithoutCommands(turnCommand, otherCommands);

		if (type === 'move')
		{
			return this.tryResolveMoveTurn(turnCommand, otherCommands, entities);
		} else if (type === 'build')
		{
			return this.tryResolveBuildTurn(turnCommand, otherCommands, entities);
		}
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

		if (!canMove)
		{
			console.log('a battle will be fought!');
		} else
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
	/**
	 * done 1) clients can specify how a unit moves to a certain tile; the intermediate steps are displayed and stored.
	 * done ->	1.1) the intermediate tiles are send to the server and displayed there as well.
	 * 2) the server checks all intermediate tiles to see where units have overlap on their journey.
	 * 4) if a unit collides, survives and collides again, it will have two collisions and be weakened from the earlier encounter.
	 * 5) at the start of each round, the health of all units is reset.
	 * 6) design choice: 
	 * ->	6.1) either, when each combat starts, players choose what their units are to do.
	 * ->		6.1.1) each player involved in a battle chooses what their unit will do during thatt battle.
	 * ->		6.1.2) soldiers can choose between attack, support, yield.
	 * ->		6.1.3) monks can choose between attack, bless, curse, yield.
	 * ->		6.1.4) merchants can choose between attack, bribe, yield.
	 * ->		6.1.5) attack means that a soldier will attack another unit;
	 * ->		6.1.6) support means that this soldier will give aid to another soldier. 
	 * 			Their attack is added to said soldier. If the attack is enough to kill the target unit, it cannot deliver its attack.
	 * ->		???6.1.7) if a soldier has more than one damage, it can attack/support multiple units.
	 * ->		6.1.8) yield means that a unit will try to back out of the fight. 
	 * 			They gain +1 defense and when attacked yet not killed, they will move back one tile from where they came.
	 * ->		6.1.9) bless gives another unit +1/+1 this battle.
	 * ->		6.1.10) curse gives another unit -1/-1 this battle. You lose -1 faith.
	 * ->		6.1.11) bribe means that another unit will not perform their action (and yield instead). You lose -1 faith.
	 * 			You must pay its owner 5 gold.
	 * ->	6.2) or, there are predetermined rules to each fight.
	 * 7) Each unit has a attack and a defense. 
	 * 8) soldier can upgrade after they won x battles (either by attacking or supporting).
	 * 9) soldiers can also invade other towns/villages/cities/capitals.
	 * 10) towns have health.
	 * 11) when a soldier attacks a town, if the town has less than 1 health, it will be captured.
	 * 12) they will lose one upgrade (capital -> city, city -> village, village -> town, town does not degrade) and will go to the 
	 * 		player that commited the most attack power to the attack.
	*/
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
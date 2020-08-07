import { TurnInformation, TurnCommand } from './turn-command';
import { BehaviorInformation, Entity } from '../entities/entity';
import { GameManager } from '../game-manager';

export class ResolveTurnCommand
{
	public tryToResolveTurnCommand(command: TurnCommand, otherCommands: TurnInformation[]): boolean
	{
		const commandBehavior: BehaviorInformation = command.turnInformation.behaviorInformation;

		for (let i = 0; i < otherCommands.length; i++) 
		{
			const otherCommand = otherCommands[i];
			const otherBehavior: BehaviorInformation = otherCommand.behaviorInformation;

			if (!this.isBehaviorValid(commandBehavior, otherBehavior))
			{
				return false;
			}
		}

		this.solidifyTurnInformation(command);
		return true;
	}

	private isBehaviorValid(behavior: BehaviorInformation, otherBehavior: BehaviorInformation): boolean
	{
		return true;
	}

	public solidifyTurnInformation(turnCommand: TurnCommand): void
	{
		const turnInformation: TurnInformation = turnCommand.turnInformation;
		//TODO: based on the type of turnCommand, make sure it is carried out.
		turnInformation.targetEntity = GameManager.instance.gridStrategy.createEntityFromCommand(turnCommand);		
		if (turnInformation.behaviorInformation.type === 'train' || 'upgrade')
		{
			GameManager.instance.gridStrategy.addEntity(turnInformation.targetCell, turnInformation.targetEntity);
			if (turnInformation.behaviorInformation.type === 'upgrade')
			{
				GameManager.instance.gridStrategy.removeEntity(turnInformation.originCell, turnInformation.originEntity);
			}
		}
	}
}
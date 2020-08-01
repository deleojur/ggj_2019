import { HostTurnSystem } from './host-turn-system';
import { TurnInformation, TurnCommand } from './turn-command';
import { BehaviorInformation } from '../entities/entity';
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
		//TODO: based on the type of turnCommand, make sure it is carried out.
		turnCommand.turnInformation.targetEntity = GameManager.instance.gridStrategy.createEntityFromCommand(turnCommand);
	}
}
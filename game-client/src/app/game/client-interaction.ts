import { TurnInformation } from './turns/turn-command';
import { BehaviorInformation, Entity } from './entities/entity';
import { Hex } from 'honeycomb-grid';
import { Cell } from './grid/grid';
import { GameManager } from './game-manager';
import { ClientStateHandler } from './states/client-states/client-state-handler';
import { Subscription } from 'rxjs';
import { WindowType } from '../ui/window/window-manager';
import { GridStrategy, RenderType } from './grid/grid-strategy';

export class ClientInteraction
{
	private hexInteractionSubscription: Subscription;

	constructor()
	{
		this.isInteractive = true;
	}

	public set isInteractive(val: boolean)
	{
		if (val)
		{
			this.hexInteractionSubscription = GameManager.instance.subscribeToClickEvent(this.onHexSelected);
		} else if (this.hexInteractionSubscription)
		{
			this.hexInteractionSubscription.unsubscribe();
		}
	}

	public cancelAcquireItem(item: BehaviorInformation, origin: Hex<Cell>, entity: Entity): void
	{
		const gameManager: GameManager = GameManager.instance;
		const turnInformation: TurnInformation = gameManager.turnSystem.removeBehaviorInformation(origin, item);
		gameManager.resourceManager.addResource(turnInformation.behaviorInformation.cost);
		if (entity === null)
		{
			gameManager.clientGrid.removeEntity(turnInformation.targetCell, turnInformation.targetEntity);
		}
		gameManager.clientGrid.clearSelectedCells();
		gameManager.windowManager.closeAllWindows();
	}

	private onHexSelected(hex: Hex<Cell>): void
	{
		const gameManager: GameManager = GameManager.instance;
		const gridStrategy: GridStrategy = gameManager.gridStrategy;
		const stateHandler: ClientStateHandler = gameManager.clientStateHandler;
		
		const entities: Entity[] = gridStrategy.getEntitiesAtHexOfOwner(hex, stateHandler.clientId);
		const turnInformation: TurnInformation[] = gameManager.turnSystem.getTurnInformation(hex);

		turnInformation.forEach(turnInfo =>
		{
			const entity: Entity = turnInfo.targetEntity;
			if (entities.indexOf(entity) === -1 && 
				entities.indexOf(turnInfo.originEntity) === -1)
			{
				entities.push(entity);
			}
		});

		if (entities.length > 0)
		{
			this.isInteractive = false;
			gridStrategy.clearSelectedCells();

			gameManager.windowManager.openWindow(WindowType.ItemOverview, { name: 'Select Action', data: { origin: hex, entities: entities } });

			const turnInformationArray: TurnInformation[] = gameManager.turnSystem.getTurnInformation(hex);
			if (turnInformationArray.length > 0)
			{
				gridStrategy.renderTurnCommandPath(turnInformationArray, stateHandler.getClientColor(), stateHandler.clientIndex);
			}
			else
			{
				gridStrategy.renderCellsOutline([hex], stateHandler.getClientColor(), stateHandler.clientIndex, RenderType.DottedLine);
			}			
		}
	}
}
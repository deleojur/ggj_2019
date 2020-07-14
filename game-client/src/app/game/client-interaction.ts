import { TurnInformation } from './turns/turn-command';
import { BehaviorInformation, Entity } from './entities/entity';
import { Hex } from 'honeycomb-grid';
import { Cell } from './grid/grid';
import { GameManager } from './game-manager';
import { GridClient } from './grid/client-grid';
import { ClientStateHandler } from './states/client-states/client-state-handler';
import { Subscription } from 'rxjs';
import { WindowType } from '../ui/window/window-manager';

export class ClientInteraction
{
	private gameManager: GameManager;
	private clientGrid: GridClient;
	private hexInteractionSubscription: Subscription;
	private clientStateHandler: ClientStateHandler;

	constructor()
	{
		this.gameManager = GameManager.instance;
		this.clientGrid = this.gameManager.clientGrid;
		this.clientStateHandler = this.gameManager.clientStateHandler;
	}

	public set isInteractive(val: boolean)
	{
		if (val)
		{
			this.hexInteractionSubscription = this.gameManager.subscribeToClickEvent((hex: Hex<Cell>) => this.onHexSelected);
		} else if (this.hexInteractionSubscription)
		{
			this.hexInteractionSubscription.unsubscribe();
		}
	}

	public cancelAcquireItem(item: BehaviorInformation, origin: Hex<Cell>, entity: Entity): void
	{
		const turnInformation: TurnInformation = this.gameManager.turnSystem.removeTurnCommand(origin, item);
		this.gameManager.resourceManager.addResource(turnInformation.behaviorInformation.cost);
		if (entity === null)
		{
			this.gameManager.clientGrid.removeEntity(turnInformation.targetCell, turnInformation.targetEntity);
		}
		this.gameManager.clientGrid.clearSelectedCells();
		this.gameManager.windowManager.closeAllWindows();
	}

	private onHexSelected(hex: Hex<Cell>): void
	{
		const entities: Entity[] = this.clientGrid.getEntitiesAtHexOfOwner(hex, this.clientStateHandler.clientId);
		const turnInformation: TurnInformation[] = this.gameManager.turnSystem.getTurnInformation(hex);

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
			this.hexInteractionSubscription.unsubscribe();
			this.gameManager.windowManager.openWindow(WindowType.ItemOverview, { name: 'Select Action', data: { origin: hex, entities: entities } });

			const turnInformationArray: TurnInformation[] = this.gameManager.turnSystem.getTurnInformation(hex);
			if (turnInformationArray.length > 0)
			{
				turnInformationArray.forEach((turnInformation: TurnInformation) =>
				{
					const origin: Hex<Cell> = turnInformation.originCell;
					const target: Hex<Cell> = turnInformation.targetCell;
					this.clientGrid.renderSelectedCellsOutline([origin, target], this.clientStateHandler.getColor());
				});				
			}
			else
			{
				this.clientGrid.renderSelectedCellsOutline([hex], this.clientStateHandler.getColor());
			}			
		}
	}
}
import { PrimaryState } from '../primary-state';
import { TurnConfirmData } from '../request-data';

export class state_playerConfirmTurn extends PrimaryState<TurnConfirmData>
{
	protected subscribeToEvents(): void
    {
        this.connectionService.subscribeToIncomingEvent<TurnConfirmData>('host_game_startLocation', 
            (turnConfirmData) => this.onDataRetrieved(turnConfirmData));
    }
}
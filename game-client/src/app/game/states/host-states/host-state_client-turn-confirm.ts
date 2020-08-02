import { PrimaryState } from '../primary-state';
import { TurnConfirmData } from '../request-data';

export class hostState_clientTurnConfirm extends PrimaryState<TurnConfirmData>
{
	/**
	 * host: whenever a client locks or unlocks, retrieve a message.
	 */
	protected subscribeToEvents(): void
    {
        this.connectionService.subscribeToIncomingEvent<TurnConfirmData>('client_game_turnConfirm',
            (turnLockedData) => this.onDataRetrieved(turnLockedData));
	}

	public requestNextTurn(): void
	{
		this.connectionService.emitOutgoingEvent('host_game_nextTurn');
	}
}
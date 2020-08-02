import { PrimaryState } from '../primary-state';
import { RequestData } from '../request-data';

export class clientState_advanceToNextTurn extends PrimaryState<RequestData>
{
	/**
	 * client: receive turnInformation for all clients.
	 */
	protected subscribeToEvents(): void
    {
        this.connectionService.subscribeToIncomingEvent<RequestData>('host_game_nextTurn', 
            (turnResolveData: RequestData) => this.onDataRetrieved(turnResolveData));
	}
}
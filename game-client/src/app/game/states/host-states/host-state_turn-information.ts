import { PrimaryState } from '../primary-state';
import { TurnInformationData } from '../request-data';

export class hostState_turnInformation extends PrimaryState<TurnInformationData>
{
	/**
	 * client: receive turnInformation for all clients.
	 */
	protected subscribeToEvents(): void
    {
        this.connectionService.subscribeToIncomingEvent<TurnInformationData>('client_game_sendTurnInformation', 
            (turnInformationData) => this.onDataRetrieved(turnInformationData));
	}

	/**
	 * Make a call to all clients requesting their turn information.
	 */
	public doRequestTurnInformation(): void
	{
		this.connectionService.emitOutgoingEvent('host_game_requestTurnInformation');
	}
}
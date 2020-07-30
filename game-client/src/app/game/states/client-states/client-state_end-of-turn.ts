import { PrimaryState } from '../primary-state';
import { RequestData, TurnInformationData } from '../request-data';

export class clientState_endOfTurn extends PrimaryState<RequestData>
{
	/**
	 * client: receive turnInformation for all clients.
	 */
	protected subscribeToEvents(): void
    {
        this.connectionService.subscribeToIncomingEvent<RequestData>('host_game_turnsResolved', 
            (requestData: RequestData) => this.onDataRetrieved(requestData));
	}

	/**
	 * Make a call to the host when turn is confirmed, either set to true or false.
	 */
	public doRequestSendTurnInformation(turnInformationData: TurnInformationData): void
	{
		this.connectionService.emitOutgoingEvent('client_game_sendTurnInformation', turnInformationData);
	}
}
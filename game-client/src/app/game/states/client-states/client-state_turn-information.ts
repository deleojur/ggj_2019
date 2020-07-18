import { PrimaryState } from '../primary-state';
import { RequestData } from '../request-data';

export class clientState_turnInformation extends PrimaryState<RequestData>
{
	/**
	 * client: receive turnInformation for all clients.
	 */
	protected subscribeToEvents(): void
    {
        this.connectionService.subscribeToIncomingEvent<RequestData>('host_game_requestTurnInformation', 
            (requestData: RequestData) => this.onDataRetrieved(requestData));
	}

	/**
	 * Make a call to the host when turn is confirmed, either set to true or false.
	 */
	public doRequestConfirmTurn(isReady: boolean): void
	{
		this.connectionService.emitOutgoingEvent('client_game_turnConfirm', isReady);
	}
}
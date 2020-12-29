import { PrimaryState } from '../../primary-state';
import { RequestCardData, ResponseCardData } from '../../request-data';

export class clientState_requestCards extends PrimaryState<ResponseCardData>
{
	/**
	 * client: receive card information from the host for a specific client (usually self).
	 */
	protected subscribeToEvents(): void
    {
        this.connectionService.subscribeToIncomingEvent<ResponseCardData>('host_response_cards', 
            (responseCard: ResponseCardData) => this.onDataRetrieved(responseCard));
	}

	public doRequestCardData(client: string, amount: number): void
	{
		this.connectionService.emitOutgoingEvent<RequestCardData>('client_request_cards', { id: client, amount: amount });
	}
}
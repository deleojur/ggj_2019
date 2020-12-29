import { PrimaryState } from "../primary-state";
import { RequestCardData, ResponseCardData } from "../request-data";

export class hostState_responseDraftCards extends PrimaryState<RequestCardData>
{
	/**
	 * host: receive card request for a specific client (usually self).
	 */
	protected subscribeToEvents(): void
    {
        this.connectionService.subscribeToIncomingEvent<RequestCardData>('client_request_draft_cards', 
            (cardRequest: RequestCardData) => this.onDataRetrieved(cardRequest));
	}

	//respond to a request with an index array.
	public doRequestCardResponse(client: string, cards: number[]): void
	{
		this.connectionService.emitOutgoingEvent<ResponseCardData>('host_response_draft_cards', { id: client, cardIds: cards });
	}
}
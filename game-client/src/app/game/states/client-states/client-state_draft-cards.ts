import { PrimaryState } from '../primary-state';
import { RequestDraftCardData, ResponseCardData } from '../request-data';

export class clientState_draftCards extends PrimaryState<ResponseCardData>
{
	/**
	 * client: receive card information from the host.
	 */
	protected subscribeToEvents(): void
    {
        this.connectionService.subscribeToIncomingEvent<ResponseCardData>('host_response_draft_cards', 
            (responseCard: ResponseCardData) => this.onDataRetrieved(responseCard));
	}

	public doRequestCardData(client: string): void
	{
		this.connectionService.emitOutgoingEvent<RequestDraftCardData>('client_request_draft_cards', 
			{ id: client });
	}
}
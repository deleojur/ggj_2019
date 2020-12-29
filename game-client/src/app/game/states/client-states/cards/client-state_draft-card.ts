import { PrimaryState } from '../../primary-state';
import { DraftData, RequestData } from '../../request-data';

export class clientState_draftStart extends PrimaryState<DraftData>
{
	/**
	 * client: receive card information from the host.
	 */
	protected subscribeToEvents(): void
    {
        this.connectionService.subscribeToIncomingEvent<DraftData>('host_draft_cards', 
            (startDraft: DraftData) => this.onDataRetrieved(startDraft));
	}

	public doRequestCardData(client: string): void
	{
		this.connectionService.emitOutgoingEvent<RequestData>('client_pick_draft_card', 
			{ id: client });
	}
}
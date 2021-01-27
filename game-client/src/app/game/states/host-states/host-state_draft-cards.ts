import { DraftDirection } from "../../cards/card-manager";
import { PrimaryState } from "../primary-state";
import { PickDraftCardData, DraftData } from "../request-data";

export class hostState_draftCards extends PrimaryState<PickDraftCardData>
{
	/**
	 * host: receive card request for a specific client (usually self).
	 */
	protected subscribeToEvents(): void
    {
        this.connectionService.subscribeToIncomingEvent<PickDraftCardData>('client_pick_draft_card', 
            (cardRequest: PickDraftCardData) => this.onDataRetrieved(cardRequest));
	}

	//respond to a request with an index array.
	public doRequestDraft(client: string, passto: string, getfrom: string, direction: DraftDirection, cards: number[]): void
	{
		this.connectionService.emitOutgoingEvent<DraftData>('host_draft_cards', { id: client, direction: direction, passto: passto, getfrom: getfrom, cardIds: cards });
	}

	public doRequestPickCard(): void
	{
		this.connectionService.emitOutgoingEvent('host_request_draft_pick');
	}

	public doRequestDraftCompleted(): void
	{
		this.connectionService.emitOutgoingEvent('host_request_draft_completed');
	}
}
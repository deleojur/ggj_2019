import { PrimaryState } from "../../primary-state";
import { RequestData, PickDraftCardData } from "../../request-data";

export class clientState_draftPickCard extends PrimaryState<RequestData>
{
	protected subscribeToEvents(): void
	{
		this.connectionService.subscribeToIncomingEvent<RequestData>('host_request_draft_pick', 
            (requestChoice: RequestData) => this.onDataRetrieved(requestChoice));
	}

	public doRequestCardChoice(cardid: number): void
	{
		this.connectionService.emitOutgoingEvent<PickDraftCardData>('client_pick_draft_card', { cardid: cardid });
	}
}
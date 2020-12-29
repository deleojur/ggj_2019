import { PrimaryState } from "../../primary-state";
import { RequestData } from "../../request-data";

export class clientState_draftCompleted extends PrimaryState<RequestData>
{
	protected subscribeToEvents(): void
	{
		this.connectionService.subscribeToIncomingEvent<RequestData>('host_request_draft_completed', 
            (requestChoice: RequestData) => this.onDataRetrieved(requestChoice));
	}
}
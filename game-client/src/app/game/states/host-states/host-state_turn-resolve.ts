import { PrimaryState } from '../primary-state';
import { TurnResolveData, TurnInformationData, RequestData } from '../request-data';
import { Resource } from '../../entities/resource';

export class hostState_turnResolve extends PrimaryState<RequestData>
{
	protected subscribeToEvents(): void
    {
        this.connectionService.subscribeToIncomingEvent<RequestData>('client_verify_turnsResolve', 
            (verifyTurnResolve: RequestData) => this.onDataRetrieved(verifyTurnResolve));
	}

	public doRequestTurnResolve(id: string, turnInformation: TurnInformationData, resources: Resource[]): void
	{
		const turnResolveData: TurnResolveData = 
		{
			id: id,
			validTurnCommands: turnInformation,
			resources: resources
		};
		this.connectionService.emitOutgoingEvent('host_game_turnsResolve', turnResolveData);
	}
}
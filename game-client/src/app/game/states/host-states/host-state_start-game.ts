import { RequestData, ClientData } from '../request-data';
import { PrimaryState } from '../primary-state';

export class hostState_startGame extends PrimaryState<RequestData>
{
    subscribeToEvents(): void
    {
        this.connectionService.subscribeToIncomingEvent('server_room_validateStartGame', 
            (data: RequestData) => this.onDataRetrieved(data));
    }

    public doRequestStartGame(clientData: ClientData[]): void
	{
        this.connectionService.emitOutgoingEvent('host_startGame', { clients: clientData });
	}
}
import { PrimaryState } from '../primary-state';
import { ClientData } from './../request-data';

export class state_clientConnection extends PrimaryState<ClientData>
{
    subscribeToEvents(): void
    {
        this.connectionService.subscribeToIncomingEvent('server_room_clientConnection', 
            (data: ClientData) => this.onDataRetrieved(data));
    }
}
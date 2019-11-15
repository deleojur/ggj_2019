import { RequestData } from './../request-data';
import { PrimaryState } from '../primary-state';

export class state_requestRoom extends PrimaryState<RequestData>
{
    subscribeToEvents(): void
    {
        this.connectionService.subscribeToIncomingEvent('server_room_created', 
            (data: RequestData) => this.onDataRetrieved(data));
    }

    doRequestCreateRoom(): void
    {
        this.connectionService.emitOutgoingEvent('host_room_createRoom');
    }
}
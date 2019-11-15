import { RequestData } from './request-data';
import { PrimaryState } from './primary-state';

export class state_startGame extends PrimaryState<RequestData>
{
    subscribeToEvents(): void
    {
        this.connectionService.subscribeToIncomingEvent('server_room_validateStartGame', 
            (data: RequestData) => this.onDataRetrieved(data));
    }

    public doRequestStartGame(): void
    {
        //TODO: everyone has to agree to start? 
        this.connectionService.emitOutgoingEvent('client_room_startGame');
    }
}
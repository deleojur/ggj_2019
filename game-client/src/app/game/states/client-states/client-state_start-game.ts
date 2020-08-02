import { HostStartGameData } from '../request-data';
import { PrimaryState } from '../primary-state';

export class clientState_startGame extends PrimaryState<HostStartGameData>
{
    subscribeToEvents(): void
    {
        this.connectionService.subscribeToIncomingEvent('host_startGame', 
            (data: HostStartGameData) => this.onDataRetrieved(data));
    }

    public doRequestStartGame(): void
    {
        //TODO: everyone has to agree to start(?)
        this.connectionService.emitOutgoingEvent('client_room_startGame');
    }
}
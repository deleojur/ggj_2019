import { PrimaryState } from '../primary-state';
import { RequestData } from './../request-data';

/**
 * this.socket.on('server_room_validateJoin', (data) => this.server_room_validateJoin(data));
 * this.socket.on('server_room_validateStartGame', () => this.server_room_validateStartGame());
 * this.socket.on('server_global_disconnected', () => { this.server_global_disconnected(); });
 */

export class state_requestJoinRoom extends PrimaryState<RequestData>
{
    protected subscribeToEvents(): void
    {
        this.connectionService.subscribeToIncomingEvent('server_room_validateJoin', 
            (data: RequestData) => this.onDataRetrieved(data));
    }

    public doRequestJoinRoom(roomid: string, name: string): void
    {
        this.connectionService.emitOutgoingEvent('client_room_join', { roomid: roomid, name: name });
    }
}
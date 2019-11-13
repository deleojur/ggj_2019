import { Hex } from 'honeycomb-grid';
import { ConnectionService } from '../../../game-shared/src/states/state-handling';
import { Router, CanActivate } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment'; 
import * as io from 'socket.io-client';
import { Cell } from '../../../game-shared/src/grid/grid';

export interface ClientData extends RoomData
{
    name: string,
    color: string,
    id: string,
    startLocation: { x: number, y: number }
};

export interface RoomData
{
    roomid: number;
};

@Injectable({
  providedIn: 'root'
})
export class HostConnectionService extends ConnectionService implements CanActivate
{
    private socket: SocketIOClient.Socket;
    private room: RoomData = null;
    public get $room(): RoomData
    {
        return this.room;
    }

    private clients: Map<string, ClientData> = new Map<string, ClientData>();
    public get $clients(): ClientData[]
    {
        const clients:  ClientData[] = Array.from(this.clients.values());
        return clients;
    }

    private onRoomCreated: Subject<RoomData> = new Subject<RoomData>();
    public get $onRoomCreated(): Subject<RoomData>
    {
        return this.onRoomCreated;
    }

    private onClientJoinedOrLeft: Subject<ClientData[]> 
        = new Subject<ClientData[]>();
    public get $onClientJoinedOrLeft(): Subject<ClientData[]>
    {
        return this.onClientJoinedOrLeft;
    }

    constructor(private router: Router)
    {
        super();
        this.connect();
    }

    public connect(): void
    {
        this.socket = io(environment.ws_url, {} );
        this.socket.emit('host_room_createRoom');

        this.socket.on('server_room_created', (data: RoomData) => { this.server_room_created(data); });
        this.socket.on('server_room_clientJoined', (data: ClientData) => { this.server_room_clientJoin(data); });
        this.socket.on('server_room_clientLeft', (data: ClientData) => { this.server_room_clientLeave(data); });
        this.socket.on('server_room_validateStartGame', () => { this.server_room_validateStartGame(); });

        this.socket.on('client_game_turnLockedIn', (data) => { console.log(data); });
    }

    public subscribeToIncomingEvent(eventName: string, callback: (socket, data) => void): SocketIOClient.Emitter
    {
        return this.socket.on(eventName, (data) =>
        {
            callback(this.socket, data);
        });
    }

    public emitOutgoingEvent(eventName: string, data: any): void
    {
        this.socket.emit(eventName, data);
    }

    private server_room_created(room: RoomData): void
    {
        this.room = room;
        this.onRoomCreated.next(room);
    }

    private server_room_validateStartGame(): void
    {
        this.clients
        this.router.navigate(['game']);
    }

    private server_room_clientJoin(client: ClientData): void
    {
        this.clients.set(client.id, client);
        this.onClientJoinedOrLeft.next(this.$clients);
    }

    private server_room_clientLeave(client: ClientData): void
    {
        this.clients.delete(client.id);
        this.onClientJoinedOrLeft.next(this.$clients);
    }

    public canActivate(): boolean
    {
        if (this.room === null)
        {
            this.router.navigate(['']);
            return false;
        }
        return true;
    }
}
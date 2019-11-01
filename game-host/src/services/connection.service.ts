import { Router, CanActivate } from '@angular/router';
import { Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment'; 
import * as io from 'socket.io-client';

export interface ClientData
{
    name: string,
    roomid: string,
    color: string,
    id: string
};

export interface RoomData
{
    roomid: number;
};

@Injectable({
  providedIn: 'root'
})
export class ConnectionService implements CanActivate
{
    private socket: SocketIOClient.Socket;
    private room: RoomData = null;

    private clients: ClientData[] = [];
    public get $clients(): ClientData[]
    {
        return this.clients;
    }

    private onRoomCreated: Subject<RoomData> = new Subject<RoomData>();
    public get $onRoomCreated(): Subject<RoomData>
    {
        return this.onRoomCreated;
    }

    private onClientJoinedOrLeft: Subject<ClientData[]> = new Subject<ClientData[]>();
    public get $onClientJoinedOrLeft(): Subject<ClientData[]>
    {
        return this.onClientJoinedOrLeft;
    }

    constructor(private router: Router)
    {
        this.connect();
    }

    connect(): void
    {
        this.socket = io(environment.ws_url, {} );
        this.socket.emit('host_room_create');

        this.socket.on('server_room_created', (data: RoomData) => { this.server_room_created(data); });
        this.socket.on('server_room_clientJoined', (data: ClientData) => { this.server_room_clientJoin(data); });
        this.socket.on('server_room_clientLeft', (data: ClientData) => { this.server_room_clientLeave(data); });
        this.socket.on('server_room_validateStartGame', () => { this.server_room_validateStartGame(); });
    }

    private server_room_created(room: RoomData): void
    {
        this.room = room;
        this.onRoomCreated.next(room);
    }

    private server_room_validateStartGame(): void
    {
        this.router.navigate(['game']);
    }

    private server_room_clientJoin(client: ClientData): void
    {
        this.clients.push(client);
        this.onClientJoinedOrLeft.next(this.clients);
    }

    private server_room_clientLeave(client: ClientData): void
    {
        for (let i = 0; i < this.clients.length; i++)
        {
            if (this.clients[i].id === client.id)
            {
                this.clients.splice(i, 1);
                break;
            }
        }
        this.onClientJoinedOrLeft.next(this.clients);
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
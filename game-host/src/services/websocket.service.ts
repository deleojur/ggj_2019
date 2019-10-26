import { Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment'; 
import * as io from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService 
{
    private socket: SocketIOClient.Socket;
    private onRoomCreated: Subject<number> = new Subject<number>();
    public get $onRoomCreated(): Subject<number>
    {
        return this.onRoomCreated;
    }

    constructor() { }

    connect(): void
    {
        this.socket = io(environment.ws_url, {} );
        this.socket.emit('host_room_create');

        this.socket.on('server_room_created', data => 
        {           
            this.onRoomCreated.next(data['roomid']);
        });
    }
}
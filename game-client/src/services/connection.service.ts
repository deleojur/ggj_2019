import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ModalService } from './modal.service';
import { environment } from '../environments/environment';
import * as io from 'socket.io-client';

export interface PlayerData
{
    name: string,
    roomid: string,
    color: string
};

@Injectable
({
    providedIn: 'root'
})
export class ConnectionService
{
    private playerData: PlayerData;
    private socket: SocketIOClient.Socket;

    constructor(        
        private router: Router, 
        private modalService: ModalService) 
    {
        this.connect();
    }

    private connect(): void
    {
        this.socket = io(environment.ws_url);
        this.socket.on('client_room_join', (data) => console.log('joined this room', data));
    }

    public joinRoom(name: string, roomid: string)
    {
        this.socket.emit('client_room_join', JSON.stringify({name: name, roomid: roomid}));
    }
}

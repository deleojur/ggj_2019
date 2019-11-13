import { StateHandler, ConnectionService } from './../../../game-shared/src/states/state-handling';
import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { ModalService } from './modal.service';
import { environment } from '../environments/environment';
import * as io from 'socket.io-client';

export interface PlayerData
{
    name: string,
    roomid: string,
    color: string,
    id: string
};

export enum Path
{
    SUBSCRIBE = 'subscribe',
    ROOM = 'room',
    GAME = 'game',
    RESULTS = 'results'
}

@Injectable
({
    providedIn: 'root'
})
export class ClientConnectionService extends ConnectionService implements CanActivate
{
    private playerData: PlayerData = null;
    public get $playerData(): PlayerData
    {
        return this.playerData;
    }
    
    private currentPath: Path = Path.SUBSCRIBE;
    public get $currentPath(): Path
    {
        return this.currentPath;
    }

    private socket: SocketIOClient.Socket;

    constructor(
        private router: Router, 
        private modalService: ModalService) 
    {
        super();
        this.connect();
    }

    private connect(): void
    {
        this.socket = io(environment.ws_url);
        this.socket.on('server_room_validateJoin', (data) => this.server_room_validateJoin(data));
        this.socket.on('server_room_validateStartGame', () => this.server_room_validateStartGame());
        this.socket.on('server_global_disconnected', () => { this.server_global_disconnected(); });
    }

    public subscribeToIncomingEvent(eventName: string, callback: (data) => void): SocketIOClient.Emitter
    {
        return this.socket.on(eventName, (data) => callback(data));
    }

    public emitOutgoingEvent(eventName: string, data: any): void
    {
        this.socket.emit(eventName, data);
    }

    private server_global_disconnected(): void
    {
        const modal = this.modalService.open( 'info', () => { this.router.navigate(['']); } );
        modal.color = '#ff0000';
        modal.header = 'Host Disconnected';
        modal.message = 'It appears that room ' + this.playerData.roomid + ' has closed.';
    }

    private server_room_validateJoin(data: PlayerData): void
    {
        this.playerData = data;
        this.currentPath = Path.ROOM;
        this.router.navigate(['room']);
    }

    private server_room_validateStartGame(): void
    {
        this.router.navigate(['game']);
    }

    public emit_joinRoom(name: string, roomid: string)
    {
        this.socket.emit('client_room_join', JSON.stringify({name: name, roomid: roomid}));
    }

    public emit_startGame(): void
    {
        this.socket.emit('client_room_startGame');
    }

    public canActivate(): boolean
    {
        if (this.playerData === null)
        {
            this.router.navigate(['']);
            return false;
        }
        return true;
    }
}

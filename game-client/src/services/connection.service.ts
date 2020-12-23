import { Injectable } from '@angular/core';
import { environment } from '../environments/environment'; 
import * as io from 'socket.io-client';
import { RequestData } from 'src/app/game/states/request-data';

@Injectable({
  providedIn: 'root'
})
export class ConnectionService
{
    private socket: SocketIOClient.Socket;  

    constructor()
    {
        this.connect();
    }

    public connect(): void
    {
        this.socket = io(environment.ws_url, {} );
    }

    public subscribeToIncomingEvent<T>(eventName: string, callback: (data: T) => void): SocketIOClient.Emitter
    {
        return this.socket.on(eventName, (data: T) => callback(data));
    }

    public emitOutgoingEvent<T /*extends RequestData*/>(eventName: string, data?: T): void
    {
        this.socket.emit(eventName, JSON.stringify(data));
    }
}
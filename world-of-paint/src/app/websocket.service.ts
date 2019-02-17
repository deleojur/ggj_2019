import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { environment } from '../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { Message } from '@angular/compiler/src/i18n/i18n_ast';

@Injectable
({
    providedIn: 'root'
})

export class WebsocketService
{
    private socket;
    private error_message:  BehaviorSubject<string> = new BehaviorSubject<string>(null);
    public $error_msg:      Observable<string>      = this.error_message.asObservable();

    private update_message: BehaviorSubject<string> = new BehaviorSubject<string>(null);
    public $update_msg:     Observable<string>      = this.update_message.asObservable();


    constructor() { }

    connect(): void
    {
        this.socket = io(environment.ws_url);
        this.socket.on('server_error', (msg) => this.error_message.next(msg));
        this.socket.on('server_update', (msg) => this.update_message.next(msg));
    }

    subscribeToRoom(data): void
    {
        this.socket.emit('client_join_room', JSON.stringify(data));
    }
    updatePlayerLocation(data): void
    {
        this.socket.emit('client_update_location', JSON.stringify(data));
    }
}

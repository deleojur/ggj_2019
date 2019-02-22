import { Injectable, EventEmitter } from '@angular/core';
import * as io from 'socket.io-client';
import { environment } from '../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable
({
    providedIn: 'root'
})
export class WebsocketService
{
    private socket;
    private error_message:  BehaviorSubject<string> = new BehaviorSubject<string>(null);
    public $error_msg:      Observable<string>      = this.error_message.asObservable();

    private _enterRoom: EventEmitter<Object> = new EventEmitter<Object>();
    private _everyoneReady: EventEmitter<boolean> = new EventEmitter<boolean>();
    private _startMatch: EventEmitter<null> = new EventEmitter<null>();
    private _endMatch: EventEmitter<Object> = new EventEmitter<Object>();
    private _startCountdown: EventEmitter<null> = new EventEmitter<null>();
    private _cancelCountdown: EventEmitter<null> = new EventEmitter<null>();

    public get $enterRoom(): EventEmitter<Object>
    {
        return this._enterRoom;
    }

    public get $everyoneReady(): EventEmitter<boolean>
    {
        return this._everyoneReady;
    }

    public get $startCountdown(): EventEmitter<null>
    {
        return this._startCountdown;
    }

    public get $cancelCountdown(): EventEmitter<null>
    {
        return this._cancelCountdown;
    }

    public get $startMatch(): EventEmitter<null>
    {
        return this._startMatch;
    }

    public get $endMatch(): EventEmitter<Object>
    {
        return this._endMatch;
    }

    connect(): void
    {
        this.socket = io(environment.ws_url);
        this.socket.on('server_error', (msg) => this.error_message.next(msg));
        this.socket.on('server_update', (data) => this.serverUpdate(data));
    }

    private serverUpdate(data: any)
    {
        switch (data.msg)
        {
            case 'join_room':
                this._enterRoom.emit(data);
            break;
            case 'everyone_ready':
                this._everyoneReady.emit(data);
            break;
            case 'start_countdown':
                this._startCountdown.emit();
            break;
            case 'cancel_countdown':
                this._cancelCountdown.emit();
            break;
            case 'match_started':
                this._startMatch.emit();
            break;
            case 'match_ended':
                this._endMatch.emit(data);
            break;
        }
    }

    sendCancelCountdown(): void
    {
        this.socket.emit('client_cancel_countdown');
    }

    sendStartCountdown(): void
    {
        this.socket.emit('client_start_countdown');
    }

    sendPlayerRoomReady(data): void
    {
        this.socket.emit('client_gameroom_ready', JSON.stringify(data));
    }

    sendUpdatePlayerAvatar(data): void
    {
        this.socket.emit('client_update_avatar', JSON.stringify(data));
    }

    sendSubscribeToRoom(data): void
    {
        this.socket.emit('client_join_room', JSON.stringify(data));
    }

    sendUpdatePlayerLocation(data): void
    {
        data.id = this.socket.id;
        this.socket.emit('client_update_location', JSON.stringify(data));
    }
}

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
    private _updateStats: EventEmitter<Object> = new EventEmitter<Object>();

    private _everyoneReady: EventEmitter<boolean> = new EventEmitter<boolean>();
    private _startMatch: EventEmitter<null> = new EventEmitter<null>();
    private _endMatch: EventEmitter<Object> = new EventEmitter<Object>();
    private _masterDisconnected: EventEmitter<null> = new EventEmitter<null>();
    private _startCountdown: EventEmitter<null> = new EventEmitter<null>();
    private _restartMatch: EventEmitter<null> = new EventEmitter<null>();
    private _returnToRoom: EventEmitter<null> = new EventEmitter<null>();
    private _cancelCountdown: EventEmitter<null> = new EventEmitter<null>();
    private _assignColor: EventEmitter<Object> = new EventEmitter<Object>();

    public get $enterRoom(): EventEmitter<Object>
    {
        return this._enterRoom;
    }

    public get $updateStats(): EventEmitter<Object>
    {
        return this._updateStats;
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

    public get $masterDisconected(): EventEmitter<null>
    {
        return this._masterDisconnected;
    }

    public get $assignColor(): EventEmitter<Object>
    {
        return this._assignColor;
    }

    public get $startMatch(): EventEmitter<null>
    {
        return this._startMatch;
    }

    public get $endMatch(): EventEmitter<Object>
    {
        return this._endMatch;
    }

    public get $restartMatch(): EventEmitter<null>
    {
        return this._restartMatch;
    }

    public get $returnToRoom(): EventEmitter<null>
    {
        return this._returnToRoom;
    }

    connect(): void
    {
        this.socket = io(environment.ws_url);
        
        this.socket.on('client_join_room', (data)       => this._enterRoom.emit(data));
        this.socket.on('client_update_stats', (data)    => this._updateStats.emit(data));

        this.socket.on('master_disconnected', ()        => this.$masterDisconected.emit());

        this.socket.on('server_everyone_ready', (data)  => this._everyoneReady.emit(data));
        this.socket.on('server_start_countdown', ()     => this._startCountdown.emit());
        this.socket.on('server_cancel_countdown', ()    => this._cancelCountdown.emit());
        this.socket.on('server_match_started', ()       => this._startMatch.emit());
        this.socket.on('server_match_ended', (data)     => this._endMatch.emit(data));

        this.socket.on('server_restart_match', ()       => this._restartMatch.emit())
        this.socket.on('server_return_to_room', ()      => this._returnToRoom.emit());

        this.socket.on('server_error', (msg)            => this.error_message.next(msg));
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
        this.socket.emit('client_update_location', JSON.stringify(data));
    }

    sendRestartMatch(): void
    {
        this.socket.emit('client_restart_match');
    }

    sendReturnToRoom(): void
    {
        this.socket.emit('client_return_to_room');
    }
}

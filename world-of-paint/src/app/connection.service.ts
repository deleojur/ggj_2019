import { Injectable, EventEmitter } from '@angular/core';
import { WebsocketService } from './websocket.service';
import { GyroService } from './gyro.service';
import { Router } from '@angular/router';

@Injectable
({
    providedIn: 'root'
})
export class ConnectionService
{
    private _playername: string;
    private _roomid: number;
    private _isinroom: boolean;
    private _ismoving: boolean = false;
    private _isshooting: boolean = false;

    public get $isinroom(): boolean
    {
        return this._isinroom;
    }

    public get $playername(): string
    {
        return this._playername;
    }

    public get $roomnumber(): number
    {
        return this._roomid;
    }

    constructor(private wsService: WebsocketService, private router: Router, private gyroService: GyroService) 
    {
        this.wsService = wsService;
        wsService.connect();
        wsService.$enterRoom.subscribe(this.enterRoom.bind(this));
        wsService.$startMatch.subscribe(this.startMatch.bind(this));
        wsService.$endMatch.subscribe(this.endMatch.bind(this));
    }

    set $isMoving(ismoving: boolean)
    {
        this._ismoving = ismoving;
    }

    set $isShooting(isshooting: boolean)
    {
        this._isshooting = isshooting;
    }
    
    sendLocation(data)
    {
        data.ismoving = this._ismoving;
        data.isshooting = this._isshooting;
        this.wsService.sendUpdatePlayerLocation(data);
    }

    private startMatch(): void
    {
        this.gyroService.startTracking(this.sendLocation.bind(this));
        this.router.navigate(['in_game']);
    }

    private endMatch(): void
    {
        this.gyroService.stopTracking();
    }

    private enterRoom(data: any): void
    {
        this._isinroom = true;
        this._playername = data.playername;
        this._roomid = data.roomid;
        this.router.navigate(['game_room']);
    }

    public subscribeToRoom(data)
    {
        this.wsService.sendSubscribeToRoom(data);
    }
}

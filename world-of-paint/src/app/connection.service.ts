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
        gyroService.addGyroListener(this.sendLocation.bind(this));
        wsService.$enterRoom.subscribe(this.enterRoom.bind(this));
        wsService.$startMatch.subscribe(this.startMatch.bind(this));
    }

    sendLocation(data)
    {
        this.wsService.sendUpdatePlayerLocation(data);
    }

    private startMatch(): void
    {
        this.router.navigate(['in_game']);
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

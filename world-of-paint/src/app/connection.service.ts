import { Injectable, EventEmitter } from '@angular/core';
import { WebsocketService } from './websocket.service';
import { GyroService } from './gyro.service';
import { Router } from '@angular/router';
import { ModalService } from './modal.service';

@Injectable
({
    providedIn: 'root'
})
export class ConnectionService
{
    private _playername: string;
    private _roomid: number;
    private _isinroom: boolean;
    private _isingame: boolean;
    private _isinresults: boolean;
    private _ismoving: boolean = false;
    private _isshooting: boolean = false;
    private _color: string = '0x0';
    private _winner: string;

    public get $isingame(): boolean
    {
        return this._isingame;
    }

    public get $isinroom(): boolean
    {
        return this._isinroom;
    }

    public get $isinresults(): boolean
    {
        return this._isinresults;
    };

    public get $playername(): string
    {
        return this._playername;
    }

    public get $roomnumber(): number
    {
        return this._roomid;
    }

    public get $color(): string
    {
        return this._color;
    }

    public get $winner(): string
    {
        return this._winner;
    }

    constructor(
        private wsService: WebsocketService, 
        private router: Router, 
        private gyroService: GyroService,
        private modalService: ModalService) 
    {
        this.wsService = wsService;
        wsService.connect();
        wsService.$enterRoom.subscribe(this.enterRoom.bind(this));
        wsService.$startMatch.subscribe(this.startMatch.bind(this));
        wsService.$endMatch.subscribe(this.endMatch.bind(this));
        wsService.$masterDisconected.subscribe(this.masterDisconnected.bind(this));

        wsService.$restartMatch.subscribe(this.restartMatch.bind(this));
        wsService.$returnToRoom.subscribe(this.returnToMatch.bind(this));
    }

    set $isMoving(ismoving: boolean)
    {
        this._ismoving = ismoving;
    }

    set $isShooting(isshooting: boolean)
    {
        this._isshooting = isshooting;
    }
    
    private startMatch(): void
    {
        this._isingame = true;
        this.gyroService.startTracking(this.sendLocation.bind(this));
        this.router.navigate(['in_game']);
    }

    private sendLocation(data)
    {
        data.ismoving = this._ismoving;
        data.isshooting = this._isshooting;
        this.wsService.sendUpdatePlayerLocation(data);
    }

    private endMatch(data): void
    {
        this.gyroService.stopTracking();
        this.router.navigate(["results"]);
        this._isingame = false;
        this._isinresults = true;
        this._winner = data.winner;
    }

    public stopTrackingGyro()
    {
        this.gyroService.startTracking(this.sendLocation.bind(this));
    }

    private enterRoom(data: any): void
    {
        this._isinroom      = true;
        this._playername    = data.playername;
        this._roomid        = data.roomid;
        this._color         = data.color;
        this.router.navigate(['game_room']);
    }

    private masterDisconnected() : void
    {
        let self            = this;
        let infomodal       = this.modalService.open('info', () =>
        {
            self.router.navigate(['']);
        });
        infomodal.header    = 'master disconnected';
        infomodal.body      = 'it appears that the room with id ' + this._roomid + ' has closed. Please restart.';
    }

    public subscribeToRoom(data)
    {
        this.wsService.sendSubscribeToRoom(data);
    }

    private restartMatch(): void
    {
        this.returnToMatch();
    }

    private returnToMatch(): void
    {
        this._isinroom      = true;
        this.router.navigate(['in_game']);
    }
}

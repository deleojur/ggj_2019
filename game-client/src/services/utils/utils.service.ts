import { RoomData } from 'src/app/game/states/request-data';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class UtilsService
{
    private _roomdata: RoomData;
    public get roomid(): string
    {
        return this._roomdata.roomid;
    }
    
    public set room(room: RoomData)
    {
        this._roomdata = room;
    }
}
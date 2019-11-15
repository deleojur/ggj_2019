import { ClientData } from '../../app/game/states/request-data';
import { UtilsService } from './utils.service';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ClientUtilsService extends UtilsService
{
    private _color: string;
    public get color(): string
    {
        return this._color;
    }

    public get colorRGB(): number
    {
        const color: string = this.color.replace('#', '0x');
        return parseInt(color);
    }

    private _client: ClientData;
    public get client(): ClientData
    {
        return this._client;
    }

    public set client(client: ClientData)
    {
        this._client = client;
        this._color = client.color;
    }
}

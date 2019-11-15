import { ClientData } from '../../app/game/states/request-data';
import { UtilsService } from './utils.service';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class HostUtilsService extends UtilsService
{
    private _clients: ClientData[] = [];
    public get clients(): ClientData[]
    {
        return this._clients;
    }

    public set clients(clients: ClientData[])
    {
        this._clients = clients;
    }
}

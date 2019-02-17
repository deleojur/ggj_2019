import { Injectable } from '@angular/core';
import { WebsocketService } from './websocket.service';
import { GyroService } from './gyro.service';

@Injectable
({
    providedIn: 'root'
})
export class ConnectionService
{
    constructor(private wsService: WebsocketService, private gyroService: GyroService) 
    {
        this.wsService = wsService;
        wsService.connect();
        gyroService.addGyroListener(this.sendLocation.bind(this));
    }

    sendLocation(data)
    {
        this.wsService.updatePlayerLocation(data);
    }

    subscribeToRoom(data)
    {
        console.log('going to send some data!');
        let someObject = {'name': 'value', 'color': 'value2', 'roomnumber': 'value3'};
        this.wsService.subscribeToRoom(data);
    }
}

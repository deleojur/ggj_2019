import { Component, Inject, OnInit  } from '@angular/core';
import { ConnectionService } from './connection.service';
import { GyroService } from './gyro.service';
import { DOCUMENT } from '@angular/common';
import { SubscribeComponent } from './subscribe/subscribe.component';

@Component
({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})

export class AppComponent
{
    title = 'world-of-paint';

    constructor(@Inject(DOCUMENT) 
        private document: any, 
        private connection: ConnectionService,
        private gyro: GyroService,
        private subscribe: SubscribeComponent)
    {
        
    }

    subscribeToRoom(data: any)
    {
        console.log('subscribe to room!');
        this.connection.subscribeToRoom(data);
    }
}

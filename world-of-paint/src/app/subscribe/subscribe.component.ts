import { Component } from '@angular/core';
import { WebsocketService } from '../websocket.service';
import { ConnectionService } from '../connection.service';
import { ModalService } from '../modal.service';

@Component
({
    selector: 'app-subscribe',
    templateUrl: './subscribe.component.html'
})
export class SubscribeComponent
{
    constructor(private websocket: WebsocketService, private connection: ConnectionService, private modalService: ModalService)
    {
        this.websocket.$error_msg.subscribe(this.displayServerWarning.bind(this));
    }

    room_invalid: boolean = false;
    name_taken: boolean = false;

    playername;
    roomid;
    serverResponse;

    displayServerWarning(msg)
    {
        switch (msg)
        {
            case 'name_taken':
                this.name_taken = true;
                break;
            case 'room_invalid':
                this.room_invalid = true;
                break;
        }
    }

    closeServerWarning(msg)
    {
        switch (msg)
        {
            case 'name_taken':
                this.name_taken = false;
                break;
            case 'room_invalid':
                this.room_invalid = false;
                break;
        }
    }

    suscribeToRoom()
    {
        this.connection.subscribeToRoom({ playername: this.playername, roomid: this.roomid });
    }
}

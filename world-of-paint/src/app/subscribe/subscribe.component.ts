import { Component, ViewChild, EventEmitter, Output, Injectable } from '@angular/core';
import { NgbCarousel } from '@ng-bootstrap/ng-bootstrap';
import { WebsocketService } from '../websocket.service';

@Component
({
    selector: 'app-subscribe',
    templateUrl: './subscribe.component.html'
})
@Injectable({ providedIn: 'root' })
export class SubscribeComponent
{
    constructor(private websocket: WebsocketService)
    {
        console.log('subscribecomponent');
        this.websocket.$error_msg.subscribe(this.displayServerWarning.bind(this));
        this.websocket.$update_msg.subscribe();
    }

    @ViewChild('carousel') carousel: NgbCarousel;
    @Output() onSubscribeToRoom = new EventEmitter<any>();

    room_invalid: boolean = false;
    name_taken: boolean = false;

    playername;
    roomid;
    serverResponse;
    images = ['../assets/images/thumb_1.jpeg', '../../assets/images/thumb_2.jpg', '../../assets/images/thumb_3.jpeg'];

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
        this.onSubscribeToRoom.emit({ playername: this.playername, roomid: this.roomid, avatar: this.carousel.activeId });
    }
}

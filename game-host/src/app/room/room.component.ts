import { WebsocketService } from './../../services/websocket.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss']
})
export class RoomComponent implements OnInit 
{
    roomid: number;
    constructor(private websocketService: WebsocketService) 
    {
        this.websocketService.$onRoomCreated.subscribe(data => { this.roomid = data; });
        this.websocketService.connect();
    }

    ngOnInit() 
    {
    }
}

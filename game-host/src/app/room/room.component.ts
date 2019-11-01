import { ConnectionService, ClientData, RoomData } from '../../services/connection.service';
import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss']
})
export class RoomComponent implements OnInit, OnDestroy
{
    room: RoomData;
    clients: ClientData[] = [];

    constructor(private connection: ConnectionService) 
    {
        
    }

    ngOnInit() 
    {
        this.connection.$onRoomCreated.subscribe((data: RoomData) => { this.room = data; });
        this.connection.$onClientJoinedOrLeft.subscribe((clients: ClientData[]) => { this.clients = clients; });
    }

    ngOnDestroy()
    {
        this.connection.$onRoomCreated.unsubscribe();
        this.connection.$onClientJoinedOrLeft.unsubscribe();
    }
}

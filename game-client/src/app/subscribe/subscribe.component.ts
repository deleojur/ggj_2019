
import { Component } from '@angular/core';
import { ClientConnectionService } from '../../services/connection.service';
import { NgForm } from '@angular/forms';

@Component
({
    selector: 'app-subscribe',
    templateUrl: './subscribe.component.html',
    styleUrls: ['./subscribe.component.scss']
})
export class SubscribeComponent
{
    constructor(private connection: ClientConnectionService)
    {
        
    }

    joinRoom(f: NgForm): void
    {
        if (f.valid)
        {
            this.connection.emit_joinRoom(f.value.name, f.value.roomid);
        }
    }
}

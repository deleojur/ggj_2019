
import { Component } from '@angular/core';
import { ConnectionService } from '../../services/connection.service';
import { ModalService } from '../../services/modal.service';
import { NgForm } from '@angular/forms';

@Component
({
    selector: 'app-subscribe',
    templateUrl: './subscribe.component.html',
    styleUrls: ['./subscribe.component.scss']
})
export class SubscribeComponent
{
    constructor(private connection: ConnectionService)
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

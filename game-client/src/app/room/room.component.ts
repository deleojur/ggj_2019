import { Component, ViewChild, OnInit } from '@angular/core';
import { NgbCarousel } from '@ng-bootstrap/ng-bootstrap';
import { ConnectionService, PlayerData } from '../../services/connection.service';
import { Router, NavigationEnd } from '@angular/router';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss']
})
export class RoomComponent implements OnInit
{
    playerData: PlayerData;

    ngOnInit()
    {
        this.playerData = this.connection.$playerData;
    }

    constructor(
        private router: Router, 
        private connection: ConnectionService)
    { 
        
    }

    startGame(): void
    {
        this.connection.emit_startGame();
    }
}

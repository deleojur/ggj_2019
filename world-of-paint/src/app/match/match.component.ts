import { Component, OnInit } from '@angular/core';
import { ConnectionService } from '../connection.service';

@Component({
  selector: 'app-match',
  templateUrl: './match.component.html',
  styleUrls: ['./match.component.scss']
})
export class MatchComponent implements OnInit 
{
    constructor(private connection: ConnectionService) { }

    ngOnInit() {}

    moveDown()
    {
        this.connection.$isMoving = true;
    }

    moveUp()
    {
        this.connection.$isMoving = false;
    }

    shootDown()
    {
        this.connection.$isShooting = true;
    }

    shootUp()
    {
        this.connection.$isShooting = false;
    }
}

import { Component, OnInit } from '@angular/core';
import { StateHandlerService } from 'src/services/state-handler.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss']
})
export class RoomComponent implements OnInit
{
    router: Router;
    constructor(
        private stateHandler: StateHandlerService, 
        private activatedRoute: ActivatedRoute,
        router: Router)
    {
        this.router = router;
    }

    ngOnInit() 
    {
        
    }

    hostGame(): void
    {
        this.router.navigate(['host'], { relativeTo: this.activatedRoute });
    }

    joinGame(): void
    {
        this.router.navigate(['client'], { relativeTo: this.activatedRoute });
    }

    goBack(): void
    {
        this.router.navigate(['room']);
    }
}

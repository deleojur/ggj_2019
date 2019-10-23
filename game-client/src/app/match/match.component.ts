import { Component, OnInit } from '@angular/core';
import { ConnectionService } from '../../services/connection.service';
import { WebsocketService } from '../../services/websocket.service';
import { Router, NavigationEnd } from '@angular/router';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-match',
  templateUrl: './match.component.html',
  styleUrls: ['./match.component.scss']
})
export class MatchComponent implements OnInit 
{
    color: string;
    score: number = 100;
    kills: number = 0;
    assists: number = 0;
    deaths: number = 0;

    buttons = [ {text: 'Restart Match'}, {text: 'Back to Menu'}, {text: 'Resume'} ];
    constructor(private router: Router, private connection: ConnectionService, 
        private modalService: ModalService, private websocketService: WebsocketService) 
    {
        router.events.subscribe((val) => 
        {
            if (val instanceof NavigationEnd)
            {
                if (val.url === '/in_game')
                {
                    if (this.connection.$isingame) //navigate to homepage
                    {
                        this.color      = this.connection.$color;
                        this.websocketService.$updateStats.subscribe(this.updateStats.bind(this));
                    } else 
                    {
                        //router.navigate(['/']);
                    }
                }
            }
        });
    }

    ngOnInit() {}

    updateStats(stats: Object) : void
    {
        this.score = stats['score'];
        this.kills = stats['kills'];
        this.assists = stats['assists'];
        this.deaths = stats['deaths'];
    }
}

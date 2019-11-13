import { Component, OnInit } from '@angular/core';
import { ClientConnectionService } from '../../services/connection.service';
import { Router, NavigationEnd } from '@angular/router';

@Component
({
    selector: 'app-results',
    templateUrl: './results.component.html',
    styleUrls: ['./results.component.scss']
})
export class ResultsComponent implements OnInit
{
    color: string;
    winnerText: string = 'You won! Congratulations! Now show your dominance by winning again!';

    constructor(
        private router: Router,
        private connection: ClientConnectionService)
    {
        router.events.subscribe((val) => 
        {
            if (val instanceof NavigationEnd && val.url === '/results')
            {
                /* if (this.connection.$isinresults)
                {
                    this.color      = this.connection.$color;
                    this.winnerText = this.connection.$winner === this.connection.$playername ?
                    this.connection.$winner + ' won! Try again and get that sweet sweet revenge!' : 
                    'You won, congratulations! Now show your dominance by winning again!';
                }
                else
                {
                    //router.navigate(['/']);
                } */
            }
        });
    }

    ngOnInit()
    {
    }

    playAgain()
    {
        
    }

    returnToRoom()
    {
        
    }
}

import { Component, ViewChild, OnInit } from '@angular/core';
import { NgbCarousel } from '@ng-bootstrap/ng-bootstrap';
import { ConnectionService } from '../../services/connection.service';
import { Router, NavigationEnd } from '@angular/router';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss']
})
export class RoomComponent implements OnInit
{
    @ViewChild('carousel', {static: false}) carousel: NgbCarousel;

    ngOnInit()
    {
        
    }

    gears = 
    [
        {movespeed: 8, turnspeed: 7, attackrate: 5, attackdamage: 3, armor: 2, name: 'Hummingbird', img: '../assets/images/thumb_1.jpeg', description: 'Very quick, with high firerate but low armor and low damage'},
        {movespeed: 2, turnspeed: 2, attackrate: 5, attackdamage: 8, armor: 8, name: 'Bumblebee', img:'../assets/images/thumb_2.jpg', description: 'Does massive damage and has high armor but slow movement and fire rate.'}, 
        {movespeed: 5, turnspeed: 5, attackrate: 3, attackdamage: 6, armor: 6, name: 'Butterfly', img:'../assets/images/thumb_3.jpeg', description: 'Tanky with some movement speed. Not designed to do massive damage.'}
    ];

    selectedGear:      Object  = this.gears[0];
    isReady:           boolean = false;
    everyoneReady:     boolean = false;
    countdownStarted:  boolean = false;
    title:             string  = 'Select Your Gear!';
    playername:        string;
    roomnumber:        number;
    color:             string;

    constructor(
        private router: Router, 
        private connection: ConnectionService,
        private modalThingy: ModalService)
    { 
        router.events.subscribe((val) => 
        {
            if (val instanceof NavigationEnd && val.url === '/game_room')
            {
                /* if (this.connection.$isinroom)
                {
                    this.playername = this.connection.$playername;
                    this.roomnumber = this.connection.$roomnumber;
                    this.color      = this.connection.$color;
                    let self        = this;
                    this.setProgressBarColor();
                }
                else
                {
                    router.navigate(['/']);
                } */
            }
        });
    }

    carouselSlide()
    {
        let self = this;
        window.setTimeout(function()
        {
            let numberPattern = /\d+/g;
            let n = parseInt(self.carousel.activeId.match(numberPattern)[0]) % self.gears.length;
            self.selectedGear = self.gears[n];
        }, 100);
    }
    
    setProgressBarColor()
    {
        let self = this;
        setTimeout(() => 
        {
            let progressBars = document.getElementsByClassName('progress-bar');
            for (var i = 0; i < progressBars.length; i++) 
            {
                progressBars[i]['style'].backgroundColor = self.color;
            }
        }, 0);
    }
}

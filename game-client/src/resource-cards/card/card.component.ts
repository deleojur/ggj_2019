import { cardModel } from './card-model';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit
{
    resourceCard: cardModel[] = [];
    unitCard: cardModel[] = [];
    constructor() { }

    ngOnInit() 
    {
        for (let i = 0; i < 24; i++)
        {
            //print per 20 per card needed.
            //20 fit precisely on one sheet of A4.
            // this.resourceCard.push(new cardModel('assets/Icons/wheat.png', 'food', 1));
            // this.resourceCard.push(new cardModel('assets/Icons/bread.png', 'food', 5));
            // this.resourceCard.push(new cardModel('assets/Icons/chicken_raw.png', 'food', 10));
            // this.resourceCard.push(new cardModel('assets/Icons/venison.png', 'food', 25));

            // this.resourceCard.push(new cardModel('assets/Icons/forester_hut00.png', 'population', 1));
            // this.resourceCard.push(new cardModel('assets/Icons/house04.png', 'population', 5));
            // this.resourceCard.push(new cardModel('assets/Icons/villageSmall01.png', 'population', 10));
            // this.resourceCard.push(new cardModel('assets/Icons/castle.png', 'population', 25));

            // this.resourceCard.push(new cardModel('assets/Icons/uranium_ore.png', 'gold', 1));         
            // this.resourceCard.push(new cardModel('assets/Icons/sulphur.png', 'gold', 5));
            // this.resourceCard.push(new cardModel('assets/Icons/gold_coins.png', 'gold', 10));
            // this.resourceCard.push(new cardModel('assets/Icons/gold_ingots.png', 'gold', 25));
        }
        
        for (let i = 0; i < 28; i++)
        {
            // this.unitCard.push(new cardModel('assets/Avatars/merchant.png', 'merchant'));
             this.unitCard.push(new cardModel('assets/Avatars/soldier_1.png', 'soldier', 1));
            // this.unitCard.push(new cardModel('assets/Avatars/soldier_2.png', 'soldier', 2));
            // this.unitCard.push(new cardModel('assets/Avatars/soldier_3.png', 'soldier', 3));
            // this.unitCard.push(new cardModel('assets/Avatars/soldier_4.png', 'soldier', 4));
            // this.unitCard.push(new cardModel('assets/Avatars/monk.png', 'monk'));
            // this.unitCard.push(new cardModel('assets/Avatars/priestess.png', 'priestess'));
            // this.unitCard.push(new cardModel('assets/Avatars/bishop.png', 'bishop'));
            // this.unitCard.push(new cardModel('assets/Avatars/mayor.png', 'mayor'));
            // this.unitCard.push(new cardModel('assets/Avatars/governor.png', 'governor'));
            // this.unitCard.push(new cardModel('assets/Avatars/king.png', 'king'));
        }
    }

    whatup(i: number): boolean
    {
        return i > 0 && ((i + 1) % 20) === 0;
    }
}

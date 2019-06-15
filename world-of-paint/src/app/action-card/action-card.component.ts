import { Component, OnInit, ViewChild } from '@angular/core';
import { trigger, state, transition, style, animate, animateChild, group, query } from '@angular/animations';

@Component({
  selector: 'app-action-card',
  templateUrl: './action-card.component.html',
  styleUrls: ['./action-card.component.scss'],
  animations:
  [
        trigger('detailedCardTransition', 
        [
            state('small', style
            ({
                transform : 'translate3d({{position_x}}px, {{position_y}}px, 0) scale(1)'
            }), {params: {position_x: 0, position_y: 0}}),
            state('large', style(
            {
                margin: '-10vh -5vw 10vh -5vw',
                transform: 'translate3d({{to_position_x}}px, 40vh, 0) scale(2.5) rotate(5deg)',

            }), {params: {to_position_x: 0}}),
            state('reset', style(
            {
                transform : 'scale(0) rotate(15deg)'
            })),
            transition('small => large', 
            [
                group
                ([
                    query('@detailedCardIconTransition', animateChild()),
                    query('@detailedCardExplanationTransition', animateChild()),
                    animate('333ms cubic-bezier(.95, -.23, 0, 1.35)')
                ])
            ]),
            transition('large => small', 
            [
                group
                ([
                    query('@detailedCardIconTransition', animateChild()),
                    query('@detailedCardExplanationTransition', animateChild()),
                    animate('333ms cubic-bezier(.92, -.43, .15, 1.03)')
                ])
            ]),
            transition('small <=> reset', animate('0ms'))
        ]),
        trigger('detailedCardIconTransition',
        [
            state('small', style
            ({
                width: '60%'
            })),
            state('large', style
            ({
                width: '40%'
            })),
            transition('small => large', animate('333ms cubic-bezier(.95, -.23, 0, 1.35)')),
            transition('large => small', animate('333ms cubic-bezier(.92, -.43, .15, 1.03)'))
        ]),
        trigger('detailedCardExplanationTransition',
        [
            state('small', style
            ({
                transform: 'scale(0)'
            })),
            state('large', style
            ({
                transform: 'scale(1)'
            })),
            transition('small => large', animate('333ms cubic-bezier(.95, -.23, 0, 1.35)')),
            transition('large => small', animate('333ms cubic-bezier(.92, -.43, .15, 1.03)'))
        ])
  ]
})
export class ActionCardComponent implements OnInit 
{
    constructor() { }

    cards = 
    [
        {deg: 0, posX: 0, posY: 0, name: 'Move Forward', icon: '../../assets/images/icon_score.svg', description: 'moves your tank one tile forward.'},
        {deg: 0, posX: 0, posY: 0, name: 'Shoot', icon: '../../assets/images/icon_kills.svg', description: 'moves your tank one tile forward.'},
       
    ];

    getCardByIndex(index): any 
    {
        return this.cards[index];
    }

    state: String = 'reset';
    viewWidth: number = 0;
    viewHeight: number;
    toPositionX: number;
    positionX: number;
    positionY: number;
    targetNode: any;
    animationNode: any;
    detailedCard: any = {name: '', description: '', icon: ''};

    ngOnInit() 
    {
        document.addEventListener('contextmenu', event => event.preventDefault());
        this.animationNode = document.getElementById('override-drag');
        this.viewWidth = document.documentElement.clientWidth;
        this.viewHeight = document.documentElement.clientHeight;

        for (let i = 0; i < this.cards.length; i++)
        {
            let c = this.cards[i];
            //c.posX = this.viewWidth / 2;
        }
    }

    openDetailedCard(event, card)
    {
        if (this.state === 'reset')
        {
            this.detailedCard = card;
            this.animationNode.style.bottom = 0;
            this.targetNode = event.target;

            do 
            {
                if (this.targetNode.id === "draggable-action-parent")
                    break;
                else this.targetNode = this.targetNode.parentNode;
            } while (true);

            this.targetNode.style.opacity = 0;
            let rect = this.targetNode.getBoundingClientRect();
            this.positionX = rect.x;
            this.positionY = rect.y;
            this.toPositionX = Math.min(Math.max(this.positionX, .2 * this.viewWidth), this.viewWidth - .25 * this.viewWidth);
            this.state = 'small';
            event.stopPropagation();
        }
    }

    closeDetailedCard(event)
    {
        if (this.state === 'large')
        {
            this.state = 'small';
        }
        event.stopPropagation();
    }

    detailedCardAnimationEnd(event)
    {
        if (event.toState === 'small')
        {
            if (event.fromState === 'reset')
            {
                this.state = 'large';
            }
            else
            {
                this.animationNode.style.bottom = '';
                this.targetNode.style.opacity = 1;
                this.state = 'reset';
            }
        }
    }
}

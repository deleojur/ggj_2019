import { Component, OnInit, HostListener, Output, EventEmitter, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { trigger, state, transition, style, animate, animateChild, group, query } from '@angular/animations';
import { MovableCardComponent } from '../movable-card/movable-card.component';

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
                transform : 'translate({{position_x}}px, {{position_y}}px) scale(1) rotate({{rot}}deg)'
            }), {params: {position_x: 0, position_y: 0, rot: 0}}),
            state('large', style(
            {
                margin: '-10vh -5vw 10vh -5vw',
                transform: 'translate({{to_position_x}}px, 40vh) scale(2.5) rotate(0deg)',
            }), {params: {to_position_x: 0, rot: 0}}),
            state('move', style(
            {
                transform : 'translate({{position_x}}px, {{position_y}}px) scale(1.25)'
            }), {params: {position_x: 0, position_y: 0}}),
            state('snap', style(
            {
                transform : 'translate({{position_x}}px, {{position_y}}px) scale(1)'
            }), {params: {position_x: 0, position_y: 0}}),
            state('reset', style(
            {
                transform : 'scale(0)'
            })),
            transition('small => large', 
            [
                group
                ([
                    query('@detailedCardIconTransition', animateChild()),
                    query('@detailedCardExplanationTransition', animateChild()),
                    animate('175ms ease-out')
                ])
            ]),
            transition('none => snap, large => snap', 
            [
                group
                ([
                    query('@detailedCardIconTransition', animateChild()),
                    query('@detailedCardExplanationTransition', animateChild()),
                    animate('150ms cubic-bezier(.92, -.43, .15, 1.03)')
                ])
            ]),
            transition('large => small, none => reset', 
            [
                group
                ([
                    query('@detailedCardIconTransition', animateChild()),
                    query('@detailedCardExplanationTransition', animateChild()),
                    animate('150ms cubic-bezier(.92, -.43, .15, 1.03)')
                ])
            ]),
            transition('move => none', 
            [
                group
                ([
                    query('@detailedCardIconTransition', animateChild()),
                    query('@detailedCardExplanationTransition', animateChild())
                ])
            ]),
            transition('large => move', animate('0ms')),
            transition('small <=> reset, snap => reset', animate('0ms')),
            transition('reset => move', animate('0ms'))
        ]),
        trigger('detailedCardIconTransition',
        [
            state('snap', style
            ({
                width: '60%'
            })),
            state('small', style
            ({
                width: '60%'
            })),
            state('large', style
            ({
                width: '50%'
            })),
            state('none', style
            ({
                width: '60%'
            })),
            transition('move => none', animate('0ms ease-out')),
            transition('small => large', animate('250ms ease-out')),
            transition('large => small', animate('333ms cubic-bezier(.92, -.43, .15, 1.03)'))
        ]),
        trigger('detailedCardExplanationTransition',
        [
            state('snap', style
            ({
                transform: 'scale(0)'
            })),
            state('small', style
            ({
                transform: 'scale(0)'
            })),
            state('large', style
            ({
                transform: 'scale(1)'
            })),
            state('none', style
            ({
                transform: 'scale(0)'
            })),
            transition('move => none', animate('0ms ease-out')),
            transition('small => large', animate('250ms ease-out')),
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
        {deg: 0, posX: 0, posY: 0, name: 'Move Forward', icon: '../../assets/images/icon_score.svg', description: 'moves your tank one tile forward.'},
        {deg: 0, posX: 0, posY: 0, name: 'Move Forward', icon: '../../assets/images/icon_score.svg', description: 'moves your tank one tile forward.'},
        {deg: 0, posX: 0, posY: 0, name: 'Move Forward', icon: '../../assets/images/icon_score.svg', description: 'moves your tank one tile forward.'},
        {deg: 0, posX: 0, posY: 0, name: 'Move Forward', icon: '../../assets/images/icon_score.svg', description: 'moves your tank one tile forward.'},
        {deg: 0, posX: 0, posY: 0, name: 'Move Forward', icon: '../../assets/images/icon_score.svg', description: 'moves your tank one tile forward.'},
        {deg: 0, posX: 0, posY: 0, name: 'Move Forward', icon: '../../assets/images/icon_score.svg', description: 'moves your tank one tile forward.'}
    ];

    slots = [];

    getCardByIndex(index): any 
    {
        return this.cards[index];
    }

    @ViewChildren('movableCard') private children: QueryList<MovableCardComponent>;

    //animations
    state:          String = 'reset';
    animationNode:  any;
    detailedCard:   any = {name: '', description: '', icon: '', card: null};

    viewWidth:      number = 0;
    viewHeight:     number = 0;
    
    detailedPosX:   number;
    positionX:      number;
    positionY:      number;
    startPosX:      number;
    startPosY:      number;
    rotation:       number;
    
    targetCardElement:     any;
    overrideNode:   any;

    move:           boolean = false;
    open:           boolean = false;
    hold:           boolean = false;
    selected:       boolean = false;
    touchStarted:   number;

    ngOnInit() 
    {
        document.addEventListener('contextmenu', event => event.preventDefault());
        this.overrideNode   = document.getElementById('override-drag');
        this.animationNode  = document.getElementById('action-card');
        this.viewWidth      = document.documentElement.clientWidth;
        this.viewHeight     = document.documentElement.clientHeight;
      
        this.calculateCardsTransform();
        this.calculateSlotsTransform();
    }

    private calculateCardsTransform() : void
    {
        let startPosition = 12;
        let startDegrees = -12;
        for (let i = 0; i < this.cards.length; i++)
        {
            let c = this.cards[i];

            c.posX = startPosition;
            c.posY = this.viewHeight - 100;
            c.deg = startDegrees;
            startPosition += 50;
            startDegrees += 2;

            setInterval(() => 
            {
                //c.deg += 5;
            }, 16);
        }
    }

    onSlotCreated(slotElement, index): void
    {
        this.slots[index].rect = slotElement.getBoundingClientRect();
    }

    private calculateSlotsTransform() : void
    {
        let step = this.viewWidth / 5;
        for (let i = 0; i < 5; i++)
        {
            this.slots[i] = { card: null, posX: step * i + 10, posY: 10 };
        }
    }

    private setDetailedCard(card): void
    {
        this.detailedCard       = card;
        this.targetCardElement  = this.detailedCard.target;
        let rect                = this.targetCardElement.getBoundingClientRect();
        this.startPosX          = rect.x;
        this.startPosY          = rect.y;
        this.rotation           = card.deg;
        this.detailedPosX       = Math.min(Math.max(this.startPosX, .2 * this.viewWidth), this.viewWidth - .25 * this.viewWidth);
    }

    private openOrCloseDetailedCard(): void
    {
        if (!this.open)
        {
            this.overrideNode.style.bottom = 0;
            this.targetCardElement.style.opacity = 0;
        } else 
        { 
            this.selected = false;
        }
        this.state = 'small';
        this.open = !this.open;
    }

    touchstart(card)
    {
        this.selected = true;
        this.hold = true;
        this.touchStarted = Date.now();
        this.setDetailedCard(card);
        setTimeout(function()
        {
            if (!this.move && this.hold)
                this.openOrCloseDetailedCard();
        }.bind(this), 350);
    }

    @HostListener('touchmove', ['$event'])
    movable_ontouchmove(event) 
    {
        if (!this.selected) 
            return;

        let startPos    = this.detailedCard.startDragPosition;
        let touch       = event.touches[0];
        this.positionX  = touch.clientX - startPos.x;
        this.positionY  = touch.clientY - startPos.y;

        if (!this.move)
        {
            this.state = 'move';
            this.overrideNode.style.bottom = 0;
            this.targetCardElement.style.opacity = 0;
        }
        this.move = true;
    }

    @HostListener('touchend', ['$event'])
    action_ontouchend(event: TouchEvent) 
    {
        if (this.selected)
        {
            if (this.detailedCard.slotID != -1)
                this.slots[this.detailedCard.slotID].card = null;

            if (!this.move)
                this.openOrCloseDetailedCard();
            else 
                this.snapToPosition();
        }
        this.move = false;
        this.hold = false;
    }

    private snapToPosition(): void
    {
        let slot = this.trySnapToSlotPosition();
        if (slot && (this.slots[slot.id].card === null || slot.id === this.detailedCard.slotID))
        {
            this.slots[slot.id].card = this.detailedCard;
            this.startPosX = slot.x;
            this.startPosY = slot.y;
            this.detailedCard.snapToSlot(slot.x, slot.y, slot.id);
        } else
        {
            this.startPosX = this.detailedCard.posX;
            this.startPosY = this.detailedCard.posY;
            this.detailedCard.snapToHand();
        }
        this.state = 'snap';
    }

    private trySnapToSlotPosition(): any
    {
        if (!this.move)
        {
            let j = this.detailedCard.slotID;
            if (j > -1)
            {
                let oldPos = this.detailedCard.position;
                return { x: oldPos.x, y: oldPos.y, id: j };
            }
        }
        let rect1 = this.animationNode.getBoundingClientRect();
        for (let i = 0; i < this.slots.length; i++)
        {
            let slot: any = this.slots[i];
            let rect2: any = slot.rect;

            let centerX = (rect1.right - rect2.right) + (rect1.left - rect2.left);
            let centerY = (rect1.bottom - rect2.bottom) + (rect1.top - rect2.top);
            
            if (Math.abs(centerX) + Math.abs(centerY) < 150)
            {
                let xDif = rect2.width - rect1.width;
                let yDif = rect2.height - rect1.height;
                return { x: rect2.x + xDif / 2, y: rect2.y + yDif / 2, id: i };
            }
        }
    }

    detailedCardAnimationEnd(event)
    {
        if (event.toState === 'small' || event.toState === 'snap')
        {
            this.open = false;
            if (event.fromState === 'reset')
            {
                this.state = 'large';
            }
            else
            {
                this.overrideNode.style.bottom = '';
                this.targetCardElement.style.opacity = 1;
                this.state = 'reset';
            }
        } else if (event.toState === 'move')
        {
            this.state = 'none';
        } else if (event.toState === 'large')
        {
            this.open = true;
        } else if (event.toState === 'reset')
        {
            this.selected = false;
        }
    }
}
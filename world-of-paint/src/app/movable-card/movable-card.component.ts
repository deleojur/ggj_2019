import { EventEmitter, Component, OnInit, Output, Input, HostListener, ElementRef } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';

interface Position 
{
    x: number;
    y: number;
}

@Component({
  selector: 'app-movable-card',
  templateUrl: './movable-card.component.html',
  styleUrls: ['./movable-card.component.scss']
})

export class MovableCardComponent implements OnInit 
{
    position:       Position = {x: 0, y: 0};
    startDragPos:   Position = {x: 0, y: 0};

    rotation:       number = 0;
    dragging:       boolean = false;
    slotID:         number = -1;
    rect:           DOMRect;
    target:         any;

    @Output() on_touchstart     = new EventEmitter<any>();
    @Input('cardInfo') cardInfo: any;

    constructor(private element: ElementRef) { }

    ngOnInit() 
    {
        this.target = this.element.nativeElement.children[0];

        this.cardInfo.target = this.target;
        this.cardInfo.snapToSlot = this.snapToSlot.bind(this);
        this.cardInfo.snapToHand = this.snapToHand.bind(this);
        this.snapToHand();
    }

    private setCardInfo(posX: number, posY: number): void
    {
        this.cardInfo.startDragPosition = 
        {
            x: posX - this.position.x,
            y: posY - this.position.y
        }
        this.cardInfo.position  = this.position;
        this.cardInfo.slotID    = this.slotID;
    }

    @HostListener('touchstart', ['$event'])
    movable_ontouchstart(event: TouchEvent) 
    {
        let touch = event.touches[0];        
        this.setCardInfo(touch.clientX, touch.clientY);
        this.on_touchstart.emit(this.cardInfo);
    }

    public snapToSlot(x: number, y: number, slot: number): void
    {
        this.position       = {x: x, y: y};
        this.startDragPos   = this.position;
        this.slotID         = slot;
        this.rotation       = 0;
    }

    public snapToHand(): void
    {
        this.position.x     = this.cardInfo.posX;
        this.position.y     = this.cardInfo.posY;
        this.startDragPos   = this.position;
        this.slotID           = -1;
        this.rotation       = this.cardInfo.deg;
    }
}
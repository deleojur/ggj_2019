import { EventEmitter, Component, OnInit, Output, Input, HostListener, ElementRef } from '@angular/core';
import { trigger, state, style, transition, group, query, animateChild, animate } from '@angular/animations';

interface Position {
    x: number;
    y: number;
  }

@Component({
  selector: 'app-movable-card',
  templateUrl: './movable-card.component.html',
  styleUrls: ['./movable-card.component.scss'],
  animations:
  [
    trigger('returnToInitialPosition', 
    [
        state('default', style
        ({
            transform : 'translate({{x}}px, {{y}}px) rotate({{rot}}deg)'
        }), {params: {x: 0, y: 0, rot: 0}}),
        state('startPosition', style(
        {
            transform: 'translate({{to_x}}px, {{to_y}}px) rotate({{rot}}deg)'
        }), {params: {to_x: 0, to_y: 0, rot: 0}}),
        transition('default => startPosition', animate('333ms cubic-bezier(.95, -.23, 0, 1.35)')),
        transition('startPosition => default', animate('0ms'))
    ])
]
})

export class MovableCardComponent implements OnInit {

    state: String = 'default';
    position: Position = {x: 0, y: 0};
    startPosition: Position = {x: 0, y: 0};
    startDragPosition: Position = {x: 0, y: 0};
    rotation = 0;
    dragging: boolean = false;

    @Output() detailedCardTapped = new EventEmitter<any>();

    @Input('cardInfo') cardInfo: any;

  constructor(private element: ElementRef) {  }

  ngOnInit() 
  {
    this.position.x = this.cardInfo.posX;
    this.position.y = this.cardInfo.posY;
    this.startPosition.x = this.cardInfo.posX;
    this.startPosition.y = this.cardInfo.posY;

    this.rotation = this.cardInfo.deg;
    this.cardInfo.target = this.element.nativeElement.children[0];
  }

  @HostListener('touchstart', ['$event'])
    movable_ontouchstart(event: TouchEvent) 
    {  
        let touch = event.touches[0];
        this.position.x = this.cardInfo.posX;
        this.position.y = this.cardInfo.posY;
        
        this.startDragPosition = 
        {
            x: touch.clientX - this.position.x,
            y: touch.clientY - this.position.y
        }
    }

    @HostListener('touchmove', ['$event'])
    movable_ontouchmove(event: TouchEvent) 
    {
        this.dragging = true;

        let touch = event.touches[0];
        this.position.x = touch.clientX - this.startDragPosition.x;
        this.position.y = touch.clientY - this.startDragPosition.y;

        this.element.nativeElement.style.transform = 'translate(100px, 100px, 0px);';
    }

    @HostListener('touchend', ['$event'])
    mnovable_ontouchend(event: TouchEvent) 
    {
        if (!this.dragging) 
        {
            return;
        }
        this.state = 'startPosition';
        this.dragging = false;
    }

    movable_onclick(event: MouseEvent)
    {
        this.detailedCardTapped.emit(this.cardInfo);
    }

    returnToInitialPositionEnd(event)
    {
        this.state = 'default';
        this.position.x = this.startPosition.x;
        this.position.y = this.startPosition.y;
    }
}

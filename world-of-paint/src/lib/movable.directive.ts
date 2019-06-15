import { Directive, EventEmitter, ElementRef, Output, HostBinding, HostListener, Input } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

interface Position {
  x: number;
  y: number;
}

@Directive({
  selector: '[appMovable]'
})
export class MovableDirective 
{
  @HostBinding('style.transform') get transform(): SafeStyle 
  {
        let translate = `translateX(${this.position.x}px) translateY(${this.position.y}px)`
        return this.sanitizer.bypassSecurityTrustStyle(translate);
  }

  @HostBinding('class.movable') movable = true;

    @HostBinding('style.transform-origin') get style(): SafeStyle
    {
        return this.sanitizer.bypassSecurityTrustStyle(`${this.position.x}px ${this.position.y}px`);
    }

  position: Position = {x: 0, y: 0};

  private startPosition: Position;

  @Input('appMovableReset') reset = false;

  @Output() touchStart = new EventEmitter<TouchEvent>();
  @Output() touchMove = new EventEmitter<TouchEvent>();
  @Output() touchEnd = new EventEmitter<TouchEvent>();

  @HostBinding('class.draggable') draggable = true;

  // to trigger pointer-events polyfill
  @HostBinding('attr.touch-action') touchAction = 'none';
  @HostBinding('class.dragging') dragging = false;

  constructor(private sanitizer: DomSanitizer, public element: ElementRef) {
  }
    @HostListener('touchstart', ['$event'])
    movable_ontouchstart(event: TouchEvent) 
    {
        let touch = event.touches[0];
        this.startPosition = 
        {
            x: touch.clientX - this.position.x,
            y: touch.clientY - this.position.y
        }
        this.touchStart.emit(event);
        this.dragging = true;
    }

    @HostListener('touchmove', ['$event'])
    movable_ontouchmove(event: TouchEvent) 
    {
        if (!this.dragging) 
        {
            return;
        }

        let touch = event.touches[0];
        this.position.x = touch.clientX - this.startPosition.x;
        this.position.y = touch.clientY - this.startPosition.y;

        this.touchMove.emit(event);
    }

    @HostListener('touchend', ['$event'])
    mnovable_ontouchend(event: TouchEvent) 
    {
        if (this.reset) 
        {
            this.position = {x: 0, y: 0};
        }

        if (!this.dragging) 
        {
            return;
        }
      
        this.dragging = false;
        this.touchEnd.emit(event);
    }
}

import { Directive, EventEmitter, Output, HostListener } from '@angular/core';

@Directive(
{
    selector: "[touch-move]"
})
export class TouchMove 
{
    @Output() on_touch_move: EventEmitter<TouchEvent> = new EventEmitter<TouchEvent>();
 
    @HostListener("touchmove", ["$event"])
    public onListenerTriggered(event: any): void 
    {
        this.on_touch_move.emit(event);
    }
 }

@Directive(
{
    selector: "[touch-end]"
})
export class TouchEnd 
{
    @Output() on_touchEnd: EventEmitter<TouchEvent> = new EventEmitter<TouchEvent>();
    
    @HostListener("touchend", ["$event"])
    public onListenerTriggered(event: any): void 
    {
        this.on_touchEnd.emit(event);
    }
}
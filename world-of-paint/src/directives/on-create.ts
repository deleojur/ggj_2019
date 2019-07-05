import { Directive, Output, EventEmitter, ElementRef} from '@angular/core';

@Directive
({
    selector: '[onCreate]'
})
export class OnCreate 
{
    @Output() onCreate: EventEmitter<any> = new EventEmitter<any>();
    constructor(private element: ElementRef) {}
    ngOnInit() 
    {
        this.onCreate.emit(this.element.nativeElement); 
    }
}
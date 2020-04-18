import { Directive, ViewContainerRef } from "@angular/core";

@Directive({
	selector: '[window-host]'
})
export class WindowDirective
{
	constructor(public viewContainerRef: ViewContainerRef) {}
}
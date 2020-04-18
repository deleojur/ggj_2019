import { Component, OnInit, ComponentFactoryResolver, ComponentFactory, ViewChild, AfterViewInit } from '@angular/core';
import { WindowDirective } from './window-directive';
import { WindowItem } from 'src/services/window.service';

@Component({
  selector: 'app-ui-window',
  templateUrl: './window.component.html',
  styleUrls: ['./window.component.scss']
})
export class WindowComponent implements OnInit, AfterViewInit
{
	showWindow: boolean = false;
	currentWindow: WindowItem = null;

	@ViewChild(WindowDirective, {static: true}) windowHost: WindowDirective;

    constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

    ngOnInit()
    {
		
	}

	ngAfterViewInit(): void
	{
		
	}

	openWindow(windowItem: WindowItem): void
	{
		const componentFactory: ComponentFactory<any> = this.componentFactoryResolver.resolveComponentFactory(windowItem.component);
		const viewContainerRef = this.windowHost.viewContainerRef;
		viewContainerRef.clear();

		const componentRef = viewContainerRef.createComponent(componentFactory);
		this.showWindow = true;
	}

	transitionEnd(e: Event): void
	{
		
	}

	public closeWindow(): void
	{
		this.showWindow = false;
	}

    closeWindowEvent($event): void
    {
        const closeWindow = $event.target.classList.contains('close-ui-window');
        if (closeWindow)
        {
            this.closeWindow();
        }
    }
}

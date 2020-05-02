import { Component, OnInit, ComponentFactoryResolver, ComponentFactory, ViewChild, AfterViewInit } from '@angular/core';
import { WindowDirective } from './window-directive';
import { WindowItem } from 'src/services/window.service';
import { Observable, Subject, Subscription } from 'rxjs';

export interface WindowOptions
{
	name: string;
	data?: any;
}

@Component({
  selector: 'app-ui-window',
  templateUrl: './window.component.html',
  styleUrls: ['./window.component.scss']
})
export class WindowComponent implements OnInit, AfterViewInit
{
	windowName: string = '';
	showWindow: boolean = false;
	
	currentWindow: WindowItem = null;
	private onTransitionEnd: Subject<null>;

	@ViewChild(WindowDirective, {static: true}) windowHost: WindowDirective;

    constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

    ngOnInit()
    {
		this.onTransitionEnd = new Subject<null>();
	}

	ngAfterViewInit(): void
	{
		
	}

	transitionEnd(e: Event): void
	{
		this.onTransitionEnd.next();
	}

	waitForTransitionEnd(callback: () => void): void
	{
		const subscription: Subscription = this.onTransitionEnd.subscribe(() => 
		{
			subscription.unsubscribe();
			if (callback)
			{
				return callback();
			}
		});
	}

	openWindow(windowItem: WindowItem, options: WindowOptions, transitionEnded?: () => void): void
	{
		this.windowName = options.name;
		const componentFactory: ComponentFactory<any> = this.componentFactoryResolver.resolveComponentFactory(windowItem.component);
		const viewContainerRef = this.windowHost.viewContainerRef;
		viewContainerRef.clear();

		const componentRef = viewContainerRef.createComponent(componentFactory);
		componentRef.instance.data = options.data;

		this.showWindow = true;	
		this.waitForTransitionEnd(transitionEnded);		
	}

	public closeWindow(transitionEnded?: () => void): void
	{
		this.showWindow = false;
		this.waitForTransitionEnd(transitionEnded);	
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

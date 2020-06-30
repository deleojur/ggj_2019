import { Component, OnInit, ComponentFactoryResolver, ComponentFactory, ViewChild, AfterViewInit } from '@angular/core';
import { WindowDirective } from './window-directive';
import { WindowItem, WindowManager } from 'src/app/ui/window/window-manager';
import { Subject, Subscription } from 'rxjs';
import { GameManager } from 'src/app/game/game-manager';

export interface WindowOptions
{
	name: string;
	data?: any;
}

export interface InnerWindowComponent
{
	beforeCloseWindow(n: number): void;
	beforeOpenWindow(n: number): void;
	afterCloseWindow(n: number): void;
	afterOpenWindow(n: number): void;

	data: any;
	width: string;
	top: string;
}

@Component({
  selector: 'app-ui-window',
  templateUrl: './window.component.html',
  styleUrls: ['./window.component.scss']
})
export class WindowComponent implements OnInit, AfterViewInit
{
	currentComponent: InnerWindowComponent = undefined;
	windowName: string = '';
	showWindow: boolean = false;

	width: string;
	top: string;
	
	currentWindow: WindowItem = null;
	private onTransitionEnd: Subject<null>;
	private _windowManager: WindowManager;

	@ViewChild(WindowDirective, {static: true}) windowHost: WindowDirective;

    constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

    ngOnInit()
    {
		this.onTransitionEnd = new Subject<null>();
		this._windowManager = GameManager.instance.windowManager;
	}

	ngAfterViewInit(): void
	{
		
	}

	transitionEnd(e: Event): void
	{
		this.onTransitionEnd.next();
	}

	waitForTransitionEnd(n: number, callback?: () => void): void
	{
		if (this.showWindow)
		{
			this.currentComponent.beforeOpenWindow(n);
			GameManager.instance.revokeControlOverHexSelection();
		} else this.currentComponent.beforeCloseWindow(n);
		const subscription: Subscription = this.onTransitionEnd.subscribe(() => 
		{
			subscription.unsubscribe();

			if (this.showWindow)
			{
				this.currentComponent.afterOpenWindow(n);
			} else
			{
				GameManager.instance.grantControlOverHexSelection(); 
				this.currentComponent.afterCloseWindow(n);
			}

			if (callback)
			{
				return callback();
			}
		});
	}

	public openWindow(windowItem: WindowItem, options: WindowOptions, n: number, transitionEnded?: () => void): void
	{
		this.windowName = options.name;
		const componentFactory: ComponentFactory<any> = this.componentFactoryResolver.resolveComponentFactory(windowItem.component);
		const viewContainerRef = this.windowHost.viewContainerRef;
		viewContainerRef.clear();

		this.currentComponent = viewContainerRef.createComponent<InnerWindowComponent>(componentFactory).instance;
		this.currentComponent.data = options.data;

		this.width = this.currentComponent.width || '45vh';
		this.top = this.currentComponent.top || '-50px';

		this.showWindow = true;
		this.waitForTransitionEnd(n, transitionEnded);		
	}

	public closeWindow(n: number, transitionEnded?: () => void): void
	{
		this.showWindow = false;
		this.waitForTransitionEnd(n, transitionEnded);
	}

    closeWindowEvent($event): void
    {
        const closeWindow = $event.target.classList.contains('close-ui-window');
        if (closeWindow)
        {
            this._windowManager.closeAllWindows();
        }
    }
}

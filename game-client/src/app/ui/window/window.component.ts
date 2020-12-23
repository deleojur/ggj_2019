import { Component, OnInit, ComponentFactoryResolver, ComponentFactory, ViewChild, AfterViewInit } from '@angular/core';
import { WindowDirective } from './window-directive';
import { WindowItem, WindowManager } from 'src/app/ui/window/window-manager';
import { Subject, Subscription } from 'rxjs';
import { GameManager } from 'src/app/game/game-manager';
import { HTMLElementSize } from 'src/app/enums';

export interface WindowOptions
{
	name: string;
	data?: any;
	windowSize?: HTMLElementSize;
}

export interface InnerWindowComponent
{
	beforeCloseWindow(n: number): void;
	beforeOpenWindow(n: number): void;
	afterCloseWindow(n: number): void;
	afterOpenWindow(n: number): void;

	data?: any;
	closeWindowButton?: boolean;
	prevWindowButton?: boolean;
}

@Component({
  selector: 'app-ui-window',
  templateUrl: './window.component.html',
  styleUrls: ['./window.component.scss']
})
export class WindowComponent implements OnInit, AfterViewInit
{
	currentComponent: InnerWindowComponent = undefined;
	currentWindow: WindowItem = null;
	windowName: string = '';
	showWindow: boolean = false;

	windowSize: HTMLElementSize;
	displayPrevWindowButton: boolean;
	displayCloseWindowButton: boolean;	
	
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
			GameManager.instance.clientInteraction.isInteractive = false;
		} else 
		{
			this.currentComponent.beforeCloseWindow(n);
			if (n === 0)
			{
				GameManager.instance.renderCellsOutline();
			}
		}

		const subscription: Subscription = this.onTransitionEnd.subscribe(() => 
		{
			subscription.unsubscribe();

			if (this.showWindow)
			{
				this.currentComponent.afterOpenWindow(n);
			} else
			{
				GameManager.instance.clientInteraction.isInteractive = true;
				this.currentComponent.afterCloseWindow(n);
			}

			if (callback)
			{
				return callback();
			}
		});
	}

	goToPreviousWindow(): void
	{
		GameManager.instance.windowManager.goToPreviousWindow();
	}

	public openWindow(windowItem: WindowItem, options: WindowOptions, n: number, transitionEnded?: () => void): void
	{
		this.windowName = options.name;
		const componentFactory: ComponentFactory<any> = this.componentFactoryResolver.resolveComponentFactory(windowItem.component);
		const viewContainerRef = this.windowHost.viewContainerRef;
		viewContainerRef.clear();

		this.currentComponent = viewContainerRef.createComponent<InnerWindowComponent>(componentFactory).instance;
		this.currentComponent.data = options.data;

		this.windowSize = options.windowSize || HTMLElementSize.Large;
		this.displayCloseWindowButton = this.currentComponent.closeWindowButton || false;
		this.displayPrevWindowButton = this.currentComponent.prevWindowButton || false;

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

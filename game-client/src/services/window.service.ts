import { Type, Injectable } from '@angular/core';
import { WindowComponent, WindowOptions } from 'src/app/ui/window/window.component';

export class WindowItem
{
	constructor (public component: Type<any>) {	}
}

export enum WindowType
{
	ItemOverview,
	ItemDetail,
	SelectCell,
	Settings
}

@Injectable({
  	providedIn: 'root'
})
export class WindowService
{
	private _windowComponent: WindowComponent;
	private _currentWindow: WindowItem = null;
	private windowTypes: Map<WindowType, WindowItem>;

	constructor()
	{
		this.windowTypes = new Map<WindowType, WindowItem>();
	}

	public set windowComponent(val: WindowComponent)
	{
		this._windowComponent = val;
	}

	public subscribeWindow(windowType: WindowType, window: WindowItem)
	{
		this.windowTypes.set(windowType, window);
	}

	/**
	 * Closes the currently active window, if one is open.
	 */
	public closeWindow(transitionEnded?: () => void)
	{
		if (this._currentWindow !== null)
		{
			this._windowComponent.closeWindow(transitionEnded);

			this._currentWindow = null;
		}
	}

	public openWindow(windowType: WindowType, windowOptions: WindowOptions, transitionEnded?: () => void): WindowItem
	{
		this._currentWindow = this.getWindow(windowType);
		this._windowComponent.openWindow(this._currentWindow, windowOptions, transitionEnded);
		return this._currentWindow;
	}

	public getWindow(windowType: WindowType): WindowItem
	{
		return this.windowTypes.get(windowType);
		//return new WindowItem(ItemWindowComponent);
	}
}

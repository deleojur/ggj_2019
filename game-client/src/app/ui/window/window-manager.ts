import { Type } from '@angular/core';
import { WindowComponent, WindowOptions, InnerWindowComponent } from 'src/app/ui/window/window.component';
import { Stack } from 'stack-typescript';
import { ItemOverviewWindowComponent } from './item-overview-window/item-overview-window.component';
import { ItemDetailWindowComponent } from './item-detail-window/item-detail-window.component';
import { SelectCellComponent } from './select-cell/select-cell.component';
import { EndOfTurnWindowComponent } from './end-of-turn-window/end-of-turn-window.component';
import { DraftCardsWindowComponent } from './draft-cards-window/draft-cards-window.component';
import { PlayCardWindowComponent } from './play-card-window/play-card-window.component';
import { DiscardCardWindowComponent } from './discard-card-window/discard-card-window.component';

export class WindowItem
{
	constructor (public component: Type<InnerWindowComponent>, private _windowType: WindowType)
	{
		
	}

	public get windowType(): WindowType
	{
		return this._windowType;
	}
}

interface WindowData
{
	windowItem: WindowItem;
	data: WindowOptions;
}

export enum WindowType
{
	None,
	ItemOverview,
	ItemDetail,
	SelectCell,
	EndOfTurn,
	DraftCards,
	PlayCards,
	DiscardCards,
	MoreOptions,
	Settings
}

export class WindowManager
{
	private _windowComponent: WindowComponent;
	private _windows: Stack<WindowData>;
	private windowTypes: Map<WindowType, WindowItem>;

	constructor()
	{
		
	}

	public init(): void
	{
		this.windowTypes = new Map<WindowType, WindowItem>();
		this._windows = new Stack<WindowData>();
		
		this.subscribeWindow(WindowType.ItemOverview, new WindowItem(ItemOverviewWindowComponent, WindowType.ItemOverview));
		this.subscribeWindow(WindowType.ItemDetail, new WindowItem(ItemDetailWindowComponent, WindowType.ItemDetail));
		this.subscribeWindow(WindowType.SelectCell, new WindowItem(SelectCellComponent, WindowType.SelectCell));
		this.subscribeWindow(WindowType.EndOfTurn, new WindowItem(EndOfTurnWindowComponent, WindowType.EndOfTurn));

		//cards windows
		this.subscribeWindow(WindowType.DraftCards, new WindowItem(DraftCardsWindowComponent, WindowType.DraftCards));
		this.subscribeWindow(WindowType.PlayCards, new WindowItem(PlayCardWindowComponent, WindowType.PlayCards));
		this.subscribeWindow(WindowType.DiscardCards, new WindowItem(DiscardCardWindowComponent, WindowType.DiscardCards));
		//DraftCardsWindowComponent
	}

	public set windowComponent(val: WindowComponent)
	{
		this._windowComponent = val;
	}

	public subscribeWindow(windowType: WindowType, window: WindowItem)
	{
		this.windowTypes.set(windowType, window);
	}

	public goToPreviousWindow(transitionEnded?: () => void): void
	{
		if (this._windows.size > 0)
		{
			this._windows.pop();
			const prev: WindowData = this._windows.head;
			const n: number = this._windows.size;
			this._windowComponent.closeWindow(n, () => 
			{
				this._windowComponent.openWindow(prev.windowItem, prev.data, n, transitionEnded);
			});
		}
	}
	
	public messageCurrentWindow(msg: string, data?: any): void
	{
		this._windowComponent.messageCurrentWindow(msg, data);
	}

	/**
	 * Closes the currently active window, if one is open.
	 */
	public closeAllWindows(transitionEnded?: () => void)
	{
		if (this._windows.size > 0)
		{
			this._windowComponent.closeWindow(0, transitionEnded);
			while (this._windows.size > 0)
			{
				this._windows.pop();
			}
		}
	}

	public get openWindows(): number
	{
		return this._windows.size;
	}

	public get isWindowOpen(): boolean
	{
		return this._windows.size > 0;
	}

	public get currentWindowType(): WindowType
	{
		if (this.isWindowOpen)
		{
			return this.currentWindowItem.windowType;
		}
		return WindowType.None;
	}

	public get currentWindowItem(): WindowItem
	{
		if (this.isWindowOpen)
		{
			return this._windows.head.windowItem;
		}
		return undefined;
	}

	public openWindow(windowType: WindowType, windowOptions: WindowOptions, transitionEnded?: () => void): WindowItem
	{		
		if (this.currentWindowType === windowType)
		{
			if (transitionEnded)
			{
				transitionEnded();
			}			
			return this.currentWindowItem;
		}

		const window: WindowItem = this.getWindow(windowType);
		const n: number = this._windows.size;
		if (n > 0)
		{
			let call = () => this._windowComponent.openWindow(window, windowOptions, n + 1, transitionEnded);

			if (windowOptions.closePreviousWindow)
			{
				this.closeAllWindows(() => 
				{
					call();
				});
			} else
			{
				this._windowComponent.closeWindow(n, () => 
				{
					call();
				});
			}
		} else
		{
			this._windowComponent.openWindow(window, windowOptions, n + 1, transitionEnded);
		}		
		this._windows.push({ windowItem: window, data: windowOptions });		
		return window;
	}

	public getWindow(windowType: WindowType): WindowItem
	{
		return this.windowTypes.get(windowType);
		//return new WindowItem(ItemWindowComponent);
	}
}

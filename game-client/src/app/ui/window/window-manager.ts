import { Type } from '@angular/core';
import { WindowComponent, WindowOptions, InnerWindowComponent } from 'src/app/ui/window/window.component';
import { Stack } from 'stack-typescript';
import { ItemOverviewWindowComponent } from './item-overview-window/item-overview-window.component';
import { ItemDetailWindowComponent } from './item-detail-window/item-detail-window.component';
import { SelectCellComponent } from './select-cell/select-cell.component';
import { EndOfTurnWindowComponent } from './end-of-turn-window/end-of-turn-window.component';
import { DraftCardsWindowComponent } from './draft-cards-window/draft-cards-window.component';

export class WindowItem
{
	constructor (public component: Type<InnerWindowComponent>) {}
}

interface WindowData
{
	windowItem: WindowItem;
	data: WindowOptions;
}

export enum WindowType
{
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
		
		this.subscribeWindow(WindowType.ItemOverview, new WindowItem(ItemOverviewWindowComponent));
		this.subscribeWindow(WindowType.ItemDetail, new WindowItem(ItemDetailWindowComponent));
		this.subscribeWindow(WindowType.SelectCell, new WindowItem(SelectCellComponent));
		this.subscribeWindow(WindowType.EndOfTurn, new WindowItem(EndOfTurnWindowComponent));

		//cards windows
		this.subscribeWindow(WindowType.DraftCards, new WindowItem(DraftCardsWindowComponent));
		//this.subscribeWindow(WindowType.EndOfTurn, new WindowItem(EndOfTurnWindowComponent));
		//this.subscribeWindow(WindowType.EndOfTurn, new WindowItem(EndOfTurnWindowComponent));
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

	public get isWindowOpen(): boolean
	{
		return this._windows.size > 0;
	}

	public openWindow(windowType: WindowType, windowOptions: WindowOptions, transitionEnded?: () => void): WindowItem
	{
		const window: WindowItem = this.getWindow(windowType);
		const n: number = this._windows.size;
		if (this._windows.size > 0)
		{
			this._windowComponent.closeWindow(n, () => 
			{
				this._windowComponent.openWindow(window, windowOptions, n + 1, transitionEnded);
			});
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

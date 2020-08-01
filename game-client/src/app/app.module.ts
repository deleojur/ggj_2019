import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { RoomComponent } from './room/room.component';
import { HostRoomComponent } from './room/host-room/host-room.component';
import { ClientRoomComponent } from './room/client-room/client-room.component';

import { GameComponent } from './game/components/game.component';
import { ClientGameComponent } from './game/components/client-game/client-game.component';
import { HostGameComponent } from './game/components/host-game/host-game.component';
import { WindowComponent } from './ui/window/window.component';
import { CardComponent } from '../resource-cards/card/card.component';
import { MenuItemComponent } from './ui/menu-item/menu-item.component';

import { ResourceComponent } from './ui/resource/resource.component';
import { WindowDirective } from './ui/window/window-directive';
import { ItemDetailWindowComponent } from './ui/window/item-detail-window/item-detail-window.component';
import { ItemOverviewWindowComponent } from './ui/window/item-overview-window/item-overview-window.component';
import { StatusBarHudComponent } from './ui/satus-bar-hud/satus-bar-hud.component';
import { SelectCellComponent } from './ui/window/select-cell/select-cell.component';
import { HostHudComponent } from './ui/host-hud/host-hud.component';
import { EndOfTurnWindowComponent } from './ui/window/end-of-turn-window/end-of-turn-window.component';

@NgModule({
	declarations: [
		WindowDirective,

		AppComponent,
		GameComponent,
		RoomComponent,
		HostRoomComponent,
		ClientRoomComponent,
		ClientGameComponent,
		HostGameComponent,
		WindowComponent,
		CardComponent,
		MenuItemComponent,
		ResourceComponent,
		ItemOverviewWindowComponent,
		ItemDetailWindowComponent,
		StatusBarHudComponent,
		SelectCellComponent,
		HostHudComponent,
		EndOfTurnWindowComponent
	],
  	entryComponents: [
		ItemOverviewWindowComponent,
		ItemDetailWindowComponent,
		SelectCellComponent
  	],
  	imports: [
		BrowserModule,
		AppRoutingModule,
		FormsModule
  	],
  	providers: [],
  	bootstrap: [AppComponent]
})
export class AppModule { }

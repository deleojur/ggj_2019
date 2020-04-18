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
import { ButtonComponent } from './ui/button/button.component';
import { WindowComponent } from './ui/window/window.component';
import { CardComponent } from '../resource-cards/card/card.component';
import { MenuItemComponent } from './ui/menu-item/menu-item.component';

import { MatCardModule } from '@angular/material/card';
import { ResourceComponent } from './ui/resource/resource.component';
import { WindowDirective } from './ui/window/window-directive';
import { ItemDetailWindowComponent } from './ui/window/item-detail-window/item-detail-window.component';
import { ItemOverviewWindowComponent } from './ui/window/item-overview-window/item-overview-window.component';

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
		ButtonComponent,
		WindowComponent,
		CardComponent,
		MenuItemComponent,
		ResourceComponent,
		ItemOverviewWindowComponent,
		ItemDetailWindowComponent
	],
  	entryComponents: [
		ItemOverviewWindowComponent,
		ItemDetailWindowComponent
  	],
  	imports: [
		BrowserModule,
		AppRoutingModule,
		FormsModule,
		MatCardModule
  	],
  	providers: [],
  	bootstrap: [AppComponent]
})
export class AppModule { }

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

@NgModule({
  declarations: [
    AppComponent,
    GameComponent,
    RoomComponent,
    HostRoomComponent,
    ClientRoomComponent,
    ClientGameComponent,
    HostGameComponent,
    ButtonComponent,
    WindowComponent,
    CardComponent
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

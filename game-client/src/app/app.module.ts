import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ConnectionService } from '../services/connection.service';
import { WebsocketService } from '../services/websocket.service';

import { Ng2CarouselamosModule } from 'ng2-carouselamos';
import { SubscribeComponent } from './subscribe/subscribe.component';

import { FormsModule } from '@angular/forms';
import { ResultsComponent } from './results/results.component';
import { RoomComponent } from './room/room.component';

import * as scrollLock from 'body-scroll-lock';
import { MatchComponent } from './match/match.component';
import { InfomodalComponent } from './infomodal/infomodal.component';
import { MenumodalComponent } from './menumodal/menumodal.component';
import { ActionCardComponent } from './action-card/action-card.component';
import { MovableCardComponent } from './movable-card/movable-card.component';
import { OnCreate } from 'src/directives/on-create';
import { TouchMove, TouchEnd } from 'src/directives/touch';
import { GameComponent } from './game/game.component';

@NgModule
({
    declarations: 
    [
        AppComponent,
        SubscribeComponent,
        RoomComponent,
        ResultsComponent,
        MatchComponent,
        InfomodalComponent,
        MenumodalComponent,
        ActionCardComponent,
        MovableCardComponent,
        OnCreate,
        TouchMove, TouchEnd,
        GameComponent
    ],
    imports: 
    [
        FormsModule,
        NgbModule,
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        Ng2CarouselamosModule,
        RouterModule.forRoot(
        [
            { path: '', component: SubscribeComponent },
            { path: 'game_room', component: RoomComponent },
            { path: 'in_game', component: MatchComponent },
            { path: 'game', component: GameComponent },
            { path: 'results', component: ResultsComponent }
        ])
    ],
    providers:
    [
        ConnectionService,
        WebsocketService
    ],
    bootstrap: [AppComponent]
})
export class AppModule
{
    constructor()
    {
        scrollLock.disableBodyScroll(document.body);
    }
}

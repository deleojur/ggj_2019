import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ConnectionService } from '../services/connection.service';

import { Ng2CarouselamosModule } from 'ng2-carouselamos';
import { SubscribeComponent } from './subscribe/subscribe.component';

import { FormsModule } from '@angular/forms';
import { ResultsComponent } from './results/results.component';
import { RoomComponent } from './room/room.component';

import * as scrollLock from 'body-scroll-lock';
import { InfomodalComponent } from './infomodal/infomodal.component';
import { MenumodalComponent } from './menumodal/menumodal.component';
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
        InfomodalComponent,
        MenumodalComponent,
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
            { path: 'room', component: RoomComponent, canActivate: [ConnectionService] },           
            { path: 'game', component: GameComponent, canActivate: [ConnectionService] },
            { path: 'results', component: ResultsComponent, canActivate: [ConnectionService] }
        ])
    ],
    providers:
    [
        ConnectionService
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

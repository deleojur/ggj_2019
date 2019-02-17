import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, NavigationStart } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ConnectionService } from './connection.service';
import { WebsocketService } from './websocket.service';

import { Ng2CarouselamosModule } from 'ng2-carouselamos';
import { SubscribeComponent } from './subscribe/subscribe.component';

import { FormsModule } from '@angular/forms';
import { GameComponent } from './game/game.component';
import { ResultsComponent } from './results/results.component';

@NgModule
({
    declarations: 
    [
        AppComponent,
        SubscribeComponent,
        GameComponent,
        ResultsComponent
    ],
    imports: 
    [
        FormsModule,
        NgbModule,
        BrowserModule,
        AppRoutingModule,
        Ng2CarouselamosModule,
        RouterModule.forRoot(
        [
            { path: '', component: SubscribeComponent,  },
            { path: 'in_game', component: GameComponent },
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
}

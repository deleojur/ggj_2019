import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

//room components
import { GameComponent } from './game/components/game.component';
import { RoomComponent } from './room/room.component';
import { ClientRoomComponent } from './room/client-room/client-room.component';

//game components
import { HostRoomComponent } from './room/host-room/host-room.component';
import { ClientGameComponent } from './game/components/client-game/client-game.component';
import { HostGameComponent } from './game/components/host-game/host-game.component';
import { CardComponent } from 'src/resource-cards/card/card.component';
import { PlayableCardComponent } from './game/components/cards/playable-card/playable-card.component';
import { CardContainerComponent } from './game/components/cards/card-container/card-container.component';

const routes: Routes = [
    { path: '', redirectTo: 'room', pathMatch: 'full' },
    { path: 'room', component: RoomComponent, children:
    [
        { path: 'client', component: ClientRoomComponent },
        { path: 'host', component: HostRoomComponent }
    ] },
    { path: 'game', component: GameComponent, children:
    [
        { path: 'client', component: ClientGameComponent },
        { path: 'host', component: HostGameComponent }
    ] },
    { path: 'card', component: CardContainerComponent } /* canActivate: [ConnectionService] */
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

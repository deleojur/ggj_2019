import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GameComponent } from './game/game.component';
import { RoomComponent } from './room/room.component';
import { ConnectionService } from 'src/services/connection.service';

const routes: Routes = [
    { path: '', component: RoomComponent }, 
    { path: 'game', component: GameComponent, /* canActivate: [ConnectionService] */ }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

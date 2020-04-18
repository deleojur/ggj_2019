import { Injectable } from '@angular/core';
import { PrimaryState } from 'src/app/game/states/primary-state';
import { RequestData } from 'src/app/game/states/request-data';
import { ConnectionService } from './connection.service';
import { GameService } from './game.service';

import { state_requestRoom } from 'src/app/game/states/host-states/state_request-room';
import { state_clientConnection } from './../app/game/states/host-states/state_client-connection';
import { state_startGame } from 'src/app/game/states/state_start-game';
import { state_requestJoinRoom } from 'src/app/game/states/client-states/state_request-join-room';
import { state_playerStartingPositions } from 'src/app/game/states/turn-state-handling/state_player-starting-positions';
import { WindowService, WindowType, WindowItem } from './window.service';
import { ItemOverviewWindowComponent } from 'src/app/ui/window/item-overview-window/item-overview-window.component';

export interface RequestState
{
    new(): PrimaryState<RequestData>;
}

@Injectable({
    providedIn: 'root'
})
export class StateHandlerService
{
    private states: Map<RequestState, PrimaryState<RequestData>>;
    private currentStates: PrimaryState<RequestData>[];

    constructor(
		private connectionService: ConnectionService,
		private gameService: GameService,
		private windowService: WindowService)
    {
        this.states = new Map<RequestState, PrimaryState<RequestData>>();
		this.registerStates();
		this.windowService.subscribeAsWindow(WindowType.ItemOverview, new WindowItem(ItemOverviewWindowComponent));
    }

    private registerStates(): void
    {
        this.clearStates();

        this.states.set(state_requestJoinRoom, new state_requestJoinRoom());
        this.states.set(state_startGame, new state_startGame());
        this.states.set(state_requestRoom, new state_requestRoom());
        this.states.set(state_clientConnection, new state_clientConnection());
        this.states.set(state_playerStartingPositions, new state_playerStartingPositions());

        this.initStates();
    }

    private clearStates(): void
    {
        this.currentStates = [];
        this.states.clear();
    }

    private initStates(): void
    {
        const states = Array.from(this.states.values());
        states.forEach((state: PrimaryState<RequestData>) => 
        {
            state.init(this.connectionService, this.gameService);
        });
    }

    public deactivateState(stateType: RequestState): void
    {
        const state: PrimaryState<RequestData> = this.states.get(stateType);
        const index: number = this.currentStates.indexOf(state);
        this.currentStates.splice(index, 1);
        state.setInactive();
    }

    public activateState<T extends RequestData>(stateType: RequestState, 
        onStateDone: (data: T) => void): PrimaryState<RequestData>
    {
        const state: PrimaryState<RequestData> = this.getState(stateType);
        this.currentStates.push(state);
        state.setActive(onStateDone);
        return state;
    }

    public getState(stateType: RequestState): PrimaryState<RequestData>
    {
        const state: PrimaryState<RequestData> = this.states.get(stateType);
        return state;
    }
};
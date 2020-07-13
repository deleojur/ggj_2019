import { Injectable } from '@angular/core';
import { PrimaryState } from 'src/app/game/states/primary-state';
import { RequestData } from 'src/app/game/states/request-data';
import { ConnectionService } from '../../../services/connection.service';
import { ClientData } from './request-data';

export interface RequestState
{
    new(): PrimaryState<RequestData>;
}

export abstract class StateHandlerService
{
	protected _clients: Map<string, ClientData>;
	
    protected _states: Map<RequestState, PrimaryState<RequestData>>;
    protected _activeStates: PrimaryState<RequestData>[];

    constructor(
		private connectionService: ConnectionService)
    {
		this._clients = new Map<string, ClientData>();
		this._states = new Map<RequestState, PrimaryState<RequestData>>();
		this._activeStates = [];
		this.registerStates();
		this.initStates();
	}
	
    protected abstract registerStates(): void;

	public get clients(): ClientData[]
	{
		return Array.from(this._clients.values());
	}

	public getClient(id: string): ClientData
	{
		return this._clients.get(id);
	}

	public getColor(id: string): number
	{
		const client: ClientData = this.getClient(id);
		const color: string = client.color.replace('#', '0x');
		return parseInt(color);
	}

    protected initStates(): void
    {
        const states = Array.from(this._states.values());
        states.forEach((state: PrimaryState<RequestData>) => 
        {
            state.init(this.connectionService);
        });
    }

    public deactivateState(stateType: RequestState): void
    {
        const state: PrimaryState<RequestData> = this._states.get(stateType);
        const index: number = this._activeStates.indexOf(state);
        this._activeStates.splice(index, 1);
        state.setInactive();
    }

    public activateState<T extends RequestData>(
		stateType: RequestState, 
		onStateDone: (data: T) => void,
		once: boolean = false): PrimaryState<RequestData>
    {
        const state: PrimaryState<RequestData> = this.getState(stateType);
        this._activeStates.push(state);
		state.setActive((data: T) => 
		{
			onStateDone(data);
			if (once)
			{
				this.deactivateState(stateType);
			}
		});
        return state;
    }

    public getState(stateType: RequestState): PrimaryState<RequestData>
    {
        const state: PrimaryState<RequestData> = this._states.get(stateType);
        return state;
	}
};
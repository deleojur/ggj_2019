import { iGame } from './../game-manager';
import * as Stack from 'stack-simple';
export abstract class State
{
    protected stateHandler: StateHandler;
    protected gameRef: iGame;
    protected requestStack: Stack;

    public setContext(stateHandler: StateHandler, gameRef: iGame): void
    {
        this.stateHandler = stateHandler;
        this.gameRef = gameRef;
    }

    public init(): void
    {
        const s: Stack = new Stack;
    }

    public abstract resolve(): void;
};

export abstract class ConnectionService
{
    abstract subscribeToIncomingEvent(eventName: string, callback: (data) => void): SocketIOClient.Emitter;
    abstract emitOutgoingEvent(eventName: string, data: any)
};

export class StateHandler
{
    protected gameRef: iGame;
    public get $gameRef(): iGame
    {
        return this.gameRef;
    }

    private connectionService: ConnectionService;
    public get $connectionService(): ConnectionService
    {
        return this.connectionService;
    }

    private currentState: State;

    init(gameRef: iGame,
        connectionService: ConnectionService): void
    {
        this.gameRef = gameRef;
        this.connectionService = connectionService;
    }

    transitionToState(state: State): void
    {
        this.currentState = state;
        this.currentState.setContext(this, this.gameRef);
        this.currentState.resolve();
    }
};
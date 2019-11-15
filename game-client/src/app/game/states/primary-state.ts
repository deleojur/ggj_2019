import { Stack } from 'stack-typescript'; 
import { ConnectionService } from 'src/services/connection.service';
import { GameService } from 'src/services/game.service';

export abstract class PrimaryState<RequestData>
{
    protected connectionService: ConnectionService;
    protected gameService: GameService;

    protected requestStack: Stack<RequestData>;

    private isActiveState: boolean = false;
    private onStateDone: (data: RequestData) => void;

    public init(connectionService: ConnectionService, gameService: GameService): void
    {
        this.connectionService = connectionService;
        this.gameService = gameService;
        this.requestStack = new Stack<RequestData>();
        this.subscribeToEvents();
    }

    public setActive(onStateDone: (data: RequestData) => void): void
    {
        this.isActiveState = true;
        
        if (this.requestStack.length > 0)
        {
            onStateDone(this.requestStack.pop());
        } else
        {
            this.onStateDone = onStateDone;
        }
    }

    public setInactive(): void
    {
        this.isActiveState = false;
    }

    protected onDataRetrieved<T extends RequestData>(data: RequestData): void
    {
        if (this.isActiveState)
        {
            this.onStateDone(data);
        } else
        {
            this.requestStack.push(data);
        }
    }

    protected abstract subscribeToEvents(): void;
};
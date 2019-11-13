import { GameManager } from './../../../../../game-shared/src/game-manager';
import { State } from './../../../../../game-shared/src/states/state-handling';
import { ClientConnectionService } from 'src/services/connection.service';

export class state_waitForStartLocation extends State
{
    private connection: ClientConnectionService;
    public resolve(): void
    {
        this.connection = this.stateHandler.$connectionService as ClientConnectionService;
        this.connection.subscribeToIncomingEvent('host_game_startLocation', (data) => this.host_game_startLocation(data));
    }

    host_game_startLocation(startLocation: {x: number, y: number})
    {
        alert('yeah! location is' + startLocation.x + ' ' + startLocation.y);
    }
}
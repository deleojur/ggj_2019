import { Cell } from './../../../../../../game-shared/src/grid/grid';
import { iGame } from './../../../../../../game-shared/src/game-manager';
import { State } from '../../../../../../game-shared/src/states/state-handling';
import { Hex } from 'honeycomb-grid';
import { HostConnectionService, ClientData } from 'src/services/connection.service';

export class state_conveyPlayerStartingPositions extends State
{
    gameRef: iGame;
    connection: HostConnectionService;
    
    resolve(): void
    {
        this.gameRef = this.stateHandler.$gameRef;
        this.connection = this.stateHandler.$connectionService as HostConnectionService;
        this.conveyPlayerStartPositions();
    }

    conveyPlayerStartPositions(): void
    {
        console.log('convey it!');
        const clients: ClientData[] = this.connection.$clients;
        const playerLocations: Hex<Cell>[] = this.getPlayerLocations();
        const locationData: { roomid: number, clients: {}[] } = { roomid: this.connection.$room.roomid, clients: [] };

        clients.forEach(client =>
        {
            const hex: Hex<Cell> = playerLocations.pop();
            client.startLocation = { x: hex.x, y: hex.y };
            locationData.clients.push({ id: client.id, startLocation: client.startLocation });
        });
        this.connection.emitOutgoingEvent('host_game_startLocation', JSON.stringify(locationData));
    }

    getPlayerLocations(): Hex<Cell>[]
    {
        const grid = this.gameRef.$grid;        
        return grid.$playerPositions;
    }
}
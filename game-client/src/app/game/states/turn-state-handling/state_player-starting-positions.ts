import { PositionData, ClientData } from '../request-data';
import { GridManager } from '../../grid/grid';
import { Hex } from 'honeycomb-grid';
import { PrimaryState } from '../primary-state';
import { Cell } from '../../grid/grid';
import { GameManager } from '../../game-manager';

export class state_playerStartingPositions extends PrimaryState<PositionData>
{
    protected subscribeToEvents(): void
    {
        this.connectionService.subscribeToIncomingEvent<PositionData>('host_game_startLocation', 
            (positionData) => this.onDataRetrieved(positionData));
    }

    public doRequestPlayerStartPositions(data: { roomid: string, clients: ClientData[] }): void
    {
        const playerLocations: Hex<Cell>[] = [];
        const locationData: { roomid: string, clients: PositionData[] } = 
            { roomid: data.roomid, clients: [] };

        data.clients.forEach(client =>
        {
            const hex: Hex<Cell> = playerLocations.pop();
            const positionData: PositionData = { x: hex.x, y: hex.y, id: client.id};
            locationData.clients.push(positionData);
        });
        this.connectionService.emitOutgoingEvent('host_game_startLocation', locationData);
    }
}
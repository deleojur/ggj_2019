import { Hex } from 'honeycomb-grid';
import { iGame } from '../../../../../game-shared/src/game-manager';
import { Cell, GridManager } from '../../../../../game-shared/src/grid/grid';
import { State } from '../../../../../game-shared/src/states/state-handling';

export class state_waitForUserInput extends State
{
    gameRef: iGame;
    gridRef: GridManager;
    public resolve(): void
    {
        this.gameRef = this.stateHandler.$gameRef;
        this.gridRef = this.gameRef.$grid;
        this.gameRef.$onHexSelected.subscribe(this.onHexSelected);

        this.stateHandler.$connectionService.subscribeToIncomingEvent('', (data) =>
        {
            
        });
    }

    private onHexSelected(hex: Hex<Cell>): void
    {
        this.gridRef.onClick
    }
}
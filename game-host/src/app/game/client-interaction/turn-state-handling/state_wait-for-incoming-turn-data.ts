import { State } from '../../../../../../game-shared/src/states/state-handling';
import { iGame } from '../../../../../../game-shared/src/game-manager';

export class State_WaitForIncomingTurnData extends State
{
    gameRef: iGame;
    public resolve(): void
    {
        this.gameRef = this.stateHandler.$gameRef;
        
        this.stateHandler.$connectionService.subscribeToIncomingEvent('', (socket, data) =>
        {
            
        });
    }
}
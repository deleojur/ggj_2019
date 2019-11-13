//import 
import { State } from '../../../../../../game-shared/src/states/state-handling';
import { HostConnectionService } from 'src/services/connection.service';

/** 
 * the goal of this class is to recieve client calls
 * which specify their turn details and parsing them
 * and delegate their message to handlers that will handle them.
*/
export class ClientTurnInfoParser extends State
{
    public constructor(private connectionService: HostConnectionService)
    {
        super();
    }

    public resolve(): void
    {
        
    }
}
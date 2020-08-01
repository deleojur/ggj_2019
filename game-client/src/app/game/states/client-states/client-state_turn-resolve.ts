import { PrimaryState } from '../primary-state';
import { TurnInformationData, TurnResolveData } from '../request-data';

export class clientState_turnResolve extends PrimaryState<TurnResolveData>
{
	/**
	 * client: receive turnInformation for all clients.
	 */
	protected subscribeToEvents(): void
    {
        this.connectionService.subscribeToIncomingEvent<TurnResolveData>('host_game_turnsResolve', 
            (turnResolveData: TurnResolveData) => this.onDataRetrieved(turnResolveData));
	}

	/**
	 * Make a call to the host when turn is confirmed, either set to true or false.
	 */
	public doRequestSendTurnInformation(turnInformationData: TurnInformationData): void
	{
		this.connectionService.emitOutgoingEvent('client_game_sendTurnInformation', turnInformationData);
	}

	public doRequestVerifyTurnResolve(): void
	{
		this.connectionService.emitOutgoingEvent('client_verify_turnsResolve');
	}
}
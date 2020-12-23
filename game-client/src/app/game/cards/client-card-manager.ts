import { WindowType } from "src/app/ui/window/window-manager";
import { GameManager } from "../game-manager";
import { ClientStateHandler } from "../states/client-states/client-state-handler";
import { clientState_requestCards } from "../states/client-states/client-state_request-cards";
import { ResponseCardData } from "../states/request-data";
import { Card } from "./card";
import { CardManager } from "./card-manager";

export class ClientCardManager extends CardManager
{
	private _stateRequestCards: clientState_requestCards;
	private _cardsInHand: Card[];

	constructor(private _clientStateHandler: ClientStateHandler)
	{
		super();
		this._cardsInHand = [];

		this.onHostResponseCardData = this.onHostResponseCardData.bind(this);
	}

	public get cardsInHand(): Card[]
	{
		return this._cardsInHand;
	}

	public onGameStarted(): void
	{
		this._stateRequestCards = this._clientStateHandler.activateState<ResponseCardData>(clientState_requestCards, this.onHostResponseCardData) as clientState_requestCards;
		this._stateRequestCards.doRequestCardData(this._clientStateHandler.clientId, 2);
	}

	private onHostResponseCardData(response: ResponseCardData): void
	{
		this._cardsInHand.push(...this.getCardsById(response.cardIds));
		GameManager.instance.windowManager.openWindow(WindowType.DraftCards, { name: "Draft Cards", data: this._cardsInHand });
	}
	//1) subscribe to incoming events from the host.
	//2) when starting a game, request for a list of card indices from the host.

}
import { DraftCardsWindowComponent } from 'src/app/ui/window/draft-cards-window/draft-cards-window.component';
import { WindowManager, WindowType } from "src/app/ui/window/window-manager";
import { GameManager } from "../game-manager";
import { ClientStateHandler } from "../states/client-states/client-state-handler";
import { clientState_draftCards } from '../states/client-states/client-state_draft-cards';
import { clientState_requestCards } from "../states/client-states/client-state_request-cards";
import { ResponseCardData } from "../states/request-data";
import { Card } from "./card";
import { CardManager } from "./card-manager";

export class ClientCardManager extends CardManager
{
	private _stateRequestCards: clientState_requestCards;
	private _stateDraftCards: clientState_draftCards;
	private _cardsInHand: Card[];
	private _windowManager: WindowManager;

	private _draftWindow: DraftCardsWindowComponent;

	constructor(private _clientStateHandler: ClientStateHandler)
	{
		super();
		this._cardsInHand = [];

		this._windowManager = GameManager.instance.windowManager;
		this.onHostResponseCardData = this.onHostResponseCardData.bind(this);
		this.onHostResponseDraftCardData = this.onHostResponseDraftCardData.bind(this); 
	}

	public get cardsInHand(): Card[]
	{
		return this._cardsInHand;
	}

	public onGameStarted(): void
	{
		this._stateDraftCards = this._clientStateHandler.activateState<ResponseCardData>(clientState_draftCards, this.onHostResponseCardData) as clientState_draftCards;
		this._stateRequestCards = this._clientStateHandler.activateState<ResponseCardData>(clientState_requestCards, this.onHostResponseCardData) as clientState_requestCards;
		this._stateDraftCards.doRequestCardData(this._clientStateHandler.clientId);
		
		setTimeout(() => {
			this.openDraftWindow();	
		}, 0);
	}

	private openDraftWindow(): void
	{
		this._windowManager.openWindow(WindowType.DraftCards, { name: "Draft Cards", data: [] });
	}

	/**
	 * 1) client -> request draft cards, open draft window
	 * 2) host -> 	respond: send cards equal to number of players.
	 * 3) client ->	show cards received from the host
	 * 2) client -> when player has picked a card, send another request to host.
	 * 3) host ->	when there are 0 cards left, send request to close the draft window and start the game.
	 */
	private onHostResponseDraftCardData(response: ResponseCardData): void
	{
		const cards: Card[] = [...this.getCardsById(response.cardIds)];
		this._windowManager.updateCurrentWindowData(cards);

		//GameManager.instance.windowManager.openWindow(WindowType.DraftCards, { data: this._cards });
	}

	private onHostResponseCardData(response: ResponseCardData): void
	{
		this._cardsInHand.push(...this.getCardsById(response.cardIds));
		
	}
	//1) subscribe to incoming events from the host.
	//2) when starting a game, request for a list of card indices from the host.

}
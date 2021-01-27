import { DraftCardsWindowComponent } from 'src/app/ui/window/draft-cards-window/draft-cards-window.component';
import { WindowManager, WindowType } from "src/app/ui/window/window-manager";
import { GameManager } from "../game-manager";
import { ClientStateHandler } from "../states/client-states/client-state-handler";
import { clientState_draftStart } from '../states/client-states/cards/client-state_draft-card';
import { ClientData, DraftData, RequestData } from "../states/request-data";
import { Card } from "./card";
import { CardManager } from "./card-manager";
import { clientState_draftPickCard } from '../states/client-states/cards/client-state_draft-pick-card';
import { clientState_draftCompleted } from '../states/client-states/cards/client-state_draft-completed';

export class ClientCardManager extends CardManager
{
	private _stateRequestDraftPick: clientState_draftPickCard;
	private _stateStartDraft: clientState_draftStart;
	private _stateDraftCompleted: clientState_draftCompleted;

	private _cardsInHand: Card[];
	private _windowManager: WindowManager;
	private _draftCardId = -1;

	private _draftWindow: DraftCardsWindowComponent;

	constructor(private _clientStateHandler: ClientStateHandler)
	{
		super();
		this._cardsInHand = [];

		this._windowManager = GameManager.instance.windowManager;
		this.onHostStartDraftRound = this.onHostStartDraftRound.bind(this);
		this.onHostRequestCardPick = this.onHostRequestCardPick.bind(this); 
	}

	public get cardsInHand(): Card[]
	{
		return this._cardsInHand;
	}

	public onNewSeasonStarted(): void
	{
		this._stateStartDraft = this._clientStateHandler.activateState<DraftData>(clientState_draftStart, this.onHostStartDraftRound) as clientState_draftStart;
		this._stateRequestDraftPick = this._clientStateHandler.activateState<RequestData>(clientState_draftPickCard, this.onHostRequestCardPick) as clientState_draftPickCard;
		this._stateDraftCompleted = this._clientStateHandler.activateState<RequestData>(clientState_draftCompleted, () =>
		{
			GameManager.instance.windowManager.openWindow(WindowType.PlayCards, { name: 'Play Cards', data: this._cardsInHand, closePreviousWindow: true });
		}) as clientState_draftCompleted;
	}

	private onHostRequestCardPick(): void
	{
		const card: Card = this.getCardById(this._draftCardId);
		this._windowManager.messageCurrentWindow('PICK_CARD', card);				
	}

	private pickCard(): void
	{
		this._cardsInHand.push(...this.getCardsById([this._draftCardId]));
		this._stateRequestDraftPick.doRequestCardChoice(this._draftCardId);
	}

	private onHostStartDraftRound(response: DraftData): void
	{
		const cards: Card[] = [...this.getCardsById(response.cardIds)];
		const randomCardId =  Math.floor(Math.random() * response.cardIds.length); //if no card is picked by the player when the host requests a card, send a random card.
		this._draftCardId = response.cardIds[randomCardId];
		this._windowManager.openWindow(WindowType.DraftCards, { name: 'Draft Cards' }, () =>
		{			
			const from: ClientData = this._clientStateHandler.getClientById(response.getfrom);
			const to: ClientData = this._clientStateHandler.getClientById(response.passto);
			this._windowManager.messageCurrentWindow('UPDATE_CONTENT', { cards: cards, direction: response.direction, passto: to, getfrom: from });
		});		
	}
	
	public pickDraftCard(cardId: number): void
	{
		this._draftCardId = cardId;
		this.pickCard();
	}
}
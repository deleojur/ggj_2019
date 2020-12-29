import { HostStateHandler } from "../states/host-states/host-state-handler";
import { hostState_responseDraftCards } from '../states/host-states/host-state_response-draft-cards';
import { hostState_responseRequestCards } from "../states/host-states/host-state_response-request-cards";
import { RequestCardData } from "../states/request-data";
import { CardManager } from "./card-manager";

export class HostCardManager extends CardManager
{
	private _draftOrder: number 

	private _shuffledDeck: number[];
	private _discardPile: number[];

	private _stateHostRespondCards: hostState_responseRequestCards;
	private _stateHostRespondDraftCards: hostState_responseDraftCards;

	constructor(private _hostStateHandler: HostStateHandler)
	{
		super();

		this.onClientRequestCardData = this.onClientRequestCardData.bind(this);
	}

	public init(): void
	{
		super.init();

		this._shuffledDeck = [];
		this._discardPile = [];
		this.initDeck();
	}

	private initDeck(): void
	{
		this._shuffledDeck = [...Array(this._cards.length).keys()];	
		let m: number = this._shuffledDeck.length;
		
		// While there remain elements to shuffle…
		while (m > 0)
		{		
			// Pick a remaining element…
			const i: number = Math.floor(Math.random() * m--);
		
			// And swap it with the current element.
			const temp: number = this._shuffledDeck[m];
			this._shuffledDeck[m] = this._shuffledDeck[i];
			this._shuffledDeck[i] = temp;
		}
	}

	private getNextCards(amount: number): number[]
	{
		return this._shuffledDeck.splice(0, amount);
	}

	public onGameStarted(): void
	{
		this._stateHostRespondCards = this._hostStateHandler.activateState<RequestCardData>(hostState_responseRequestCards, this.onClientRequestCardData) as hostState_responseRequestCards;
		this._stateHostRespondDraftCards = this._hostStateHandler.activateState<RequestCardData>(hostState_responseDraftCards, this.onClientRequestDraftCardData) as hostState_responseDraftCards;
	}

	//start draft. Give every player a draft order id.
	private startDraft(): void
	{

	}

	private onClientRequestCardData(request: RequestCardData): void
	{
		const cards: number[] = this.getNextCards(request.amount);
		this._stateHostRespondCards.doRequestCardResponse(request.id, cards);
	}

	private onClientRequestDraftCardData(request: RequestCardData): void
	{
		//const cards: number[] = 
	}
	//1) subscribe to incoming events from clients.
}

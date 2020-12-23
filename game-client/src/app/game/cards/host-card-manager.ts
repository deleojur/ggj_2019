import { HostStateHandler } from "../states/host-states/host-state-handler";
import { hostState_responseCard } from "../states/host-states/host-state_response-card";
import { RequestCardData } from "../states/request-data";
import { CardManager } from "./card-manager";

export class HostCardManager extends CardManager
{
	private _shuffledDeck: number[];
	private _discardPile: number[];

	private _stateHostRespondCards: hostState_responseCard;

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
		this._stateHostRespondCards = this._hostStateHandler.activateState<RequestCardData>(hostState_responseCard, this.onClientRequestCardData) as hostState_responseCard;
	}

	private onClientRequestCardData(request: RequestCardData): void
	{
		const cards: number[] = this.getNextCards(request.amount);
		this._stateHostRespondCards.doRequestCardResponse(request.id, cards);
	}
	//1) subscribe to incoming events from clients.
}

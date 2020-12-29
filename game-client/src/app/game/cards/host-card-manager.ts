import { HostStateHandler } from "../states/host-states/host-state-handler";
import { hostState_draftCards } from '../states/host-states/host-state_draft-cards';
import { HostWaitForClientReplies } from "../states/host-wait-for-clients-reply";
import { ClientData, DraftData, PickDraftCardData, RequestCardData } from "../states/request-data";
import { CardManager, DraftDirection } from "./card-manager";

interface ClientDraft
{
	left: string;
	right: string;
	draftCards: number[];
}

export class HostCardManager extends CardManager
{
	private readonly NUMBER_OF_DRAFT_CARDS: number = 3;
	private draftRounds: number = 0;

	private _draftOrder: number

	private _shuffledDeck: number[];
	private _discardPile: number[];
	
	private _clientDraftListener: hostState_draftCards;

	private _clients: ClientData[];
	private _clientDraftDetails: Map<string, ClientDraft> = new Map<string, ClientDraft>();
	private _draftDirection: DraftDirection = DraftDirection.Left;

	private hostWaitForClientReplies: HostWaitForClientReplies<PickDraftCardData>;

	constructor(private _hostStateHandler: HostStateHandler)
	{
		super();	

		this.onClientRequestCardData = this.onClientRequestCardData.bind(this);
		this.onClientPickReceived = this.onClientPickReceived.bind(this);
	}

	public init(): void
	{
		super.init();		
		this._shuffledDeck = [];
		this._discardPile = [];
		this._clients = this._hostStateHandler.clients;
		this.hostWaitForClientReplies = new HostWaitForClientReplies<PickDraftCardData>(this._clients);
		this.onReceivedAllCardPicks = this.onReceivedAllCardPicks.bind(this);
		this.hostWaitForClientReplies.onAllRequestsHandled(this.onReceivedAllCardPicks);
		
		this._clients.forEach((client, i) =>
		{
			//TODO: shuffle.
			const left: number = this.roundModulo(i - 1, this._clients.length);
			const right: number = this.roundModulo(i + 1, this._clients.length);			
			this._clientDraftDetails.set(client.id, { draftCards: [], left: this._clients[left].id, right: this._clients[right].id });			
		});
		this.initDeck();		
	}

	private initDeck(): void
	{
		this._shuffledDeck = [...Array(this._cardDetails.length).keys()];	
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

	private startListeningForReplies(): void
	{
		this.hostWaitForClientReplies.start(5000, () => 
		{
			this._clientDraftListener.doRequestPickCard();
		});
	}

	public onNewSeasonStarted(): void
	{
		this._clientDraftListener = this._hostStateHandler.activateState<PickDraftCardData>(hostState_draftCards, this.onClientPickReceived) as hostState_draftCards;
		this.draftRounds = 0;
		
		this._clients.forEach(client =>
		{			
			this._clientDraftDetails.get(client.id).draftCards = this.getNextCards(this.NUMBER_OF_DRAFT_CARDS);
			this.emitDraftRequest(client);
		});
		this.startListeningForReplies();
		//this._draftDirection = this.flipDraftDirection(this._draftDirection);
	}

	private onReceivedAllCardPicks(responses: Map<string, PickDraftCardData>): void
	{
		const tempCards: Map<string, number[]> = new Map<string, number[]>();
		this._clients.forEach((client) =>
		{
			const draftData: ClientDraft = this._clientDraftDetails.get(client.id);
			const cardId: number = responses.get(client.id).cardid;
			const i: number = draftData.draftCards.indexOf(cardId);
			if (i !== -1)
			{
				draftData.draftCards.splice(i, 1);
				tempCards.set(client.id, draftData.draftCards);
			}
		});

		this._clients.forEach(client =>
		{
			const draftData: ClientDraft = this._clientDraftDetails.get(client.id);
			const direction: string = this._draftDirection === DraftDirection.Left ? draftData.left : draftData.right;
			draftData.draftCards = tempCards.get(direction);
			this.emitDraftRequest(client);
		});

		if (++this.draftRounds === this.NUMBER_OF_DRAFT_CARDS)
		{
			this._clientDraftListener.doRequestDraftCompleted();
		} else
		{
			this.startListeningForReplies();
		}
	}

	private flipDraftDirection(draftDirection: DraftDirection): DraftDirection
	{
		if (draftDirection === DraftDirection.Left)
			return DraftDirection.Right;
		return DraftDirection.Left;
	}

	private emitDraftRequest(client: ClientData): void
	{		
		const clientDraft: ClientDraft = this._clientDraftDetails.get(client.id);
		const cards: number[] = clientDraft.draftCards;
		const passto: string = this._draftDirection === DraftDirection.Left ? clientDraft.left : clientDraft.right;
		const getfrom: string = this._draftDirection === DraftDirection.Right ? clientDraft.right : clientDraft.left;
		this._clientDraftListener.doRequestDraft(client.id, passto, getfrom, this._draftDirection, cards);
	}

	private roundModulo(i: number, n: number): number
	{
		return (i % n + n) % n;
	}

	private onClientPickReceived(request: PickDraftCardData): void
	{
		this.hostWaitForClientReplies.handleClientRequest(request);
	}

	private onClientRequestCardData(request: RequestCardData): void
	{
		const cards: number[] = this.getNextCards(request.amount);
		
	}

	private onClientRequestDraftCardData(request: RequestCardData): void
	{
	}
}

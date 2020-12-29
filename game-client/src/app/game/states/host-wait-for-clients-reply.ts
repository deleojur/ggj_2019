import { interval, Subject, Subscription } from "rxjs";
import { take } from "rxjs/operators";
import { ClientData, RequestData } from "./request-data";

export class HostWaitForClientReplies<T extends RequestData>
{
	private _onAllRequestsHandled: Subject<Map<string, T>>;
	private _clientRequests: Map<string, T>;
	private _numberOfClients: number;
	private _timeoutSubscription: Subscription;

	constructor(private _clients: ClientData[])
	{
		this._numberOfClients = _clients.length;
		this._clientRequests = new Map<string, T>();
		this._onAllRequestsHandled = new Subject<Map<string, T>>();	
	}

	public handleClientRequest(request: T): void
	{
		this._clientRequests.set(request.id, request);
		const numberOfRequestsHandled: number = this._clientRequests.size;
		if (numberOfRequestsHandled === this._numberOfClients)
		{
			this._timeoutSubscription.unsubscribe();
			this._onAllRequestsHandled.next(this._clientRequests);
		}
	}

	public start(timeout: number, timeoutReached: () => void): void
	{
		this._clientRequests.clear();
		this._timeoutSubscription = interval(timeout).pipe(take(1)).subscribe(() =>
		{
			timeoutReached();
		});
	}

	public onAllRequestsHandled(f: (response: Map<string, T>) => void ): Subscription
	{
		return this._onAllRequestsHandled.subscribe(f);
	}
}
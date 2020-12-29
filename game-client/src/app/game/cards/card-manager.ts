import { AssetLoader } from "src/app/asset-loader";
import { Card } from "./card";

export abstract class CardManager
{
	protected _cards: Card[];
	
	public init(): void
	{
		this._cards = AssetLoader.instance.cards;
	}

	public getCardsById(ids: number[]): Card[]
	{
		const values: Card[] = [];
		ids.forEach(id =>
		{
			values.push(this._cards[id]);
		});
		return values;
	}

	public abstract onGameStarted(): void;
}
import { AssetLoader } from "src/app/asset-loader";
import { Card } from "./card";

export enum DraftDirection
{
	Left = 'left',
	Right = 'right'
};

export abstract class CardManager
{
	protected _cardDetails: Card[];
	
	public init(): void
	{
		this._cardDetails = AssetLoader.instance.cards;		
	}

	public getCardById(id: number): Card
	{
		return this._cardDetails[id];
	}

	public getCardsById(ids: number[]): Card[]
	{
		const values: Card[] = [];
		ids.forEach(id =>
		{
			values.push(this._cardDetails[id]);
		});
		return values;
	}

	public abstract onNewSeasonStarted(): void;
}
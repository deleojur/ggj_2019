import { Resource } from './resource';

export enum CardType
{
	'Concealed' = 'Concealed',
	'Build' = 'Build',
	'Attack' = 'Attack'
}

export class CardTier
{
	public get resources(): Resource[] 
	{
		return this._resources;
	}
	public set resources(value: Resource[]) 
	{
		this._resources = value;
	}

	public get description(): string 
	{
		return this._description;
	}
	public set description(value: string) 
	{
		this._description = value;
	}

	public get title(): string 
	{
		return this._title;
	}
	public set title(value: string) 
	{
		this._title = value;
	}

	constructor(
		private _title : string, 
		private _description: string,
		private _resources: Resource[])
	{

	}
}

export class Card
{
	public get tiers(): CardTier[] 
	{
		return this._tiers;
	}
	public set tiers(value: CardTier[]) 
	{
		this._tiers = value;
	}

	public get type(): string 
	{
		return this._type;
	}
	public set type(value: string) 
	{
		this._type = value;
	}

	public get faction(): string 
	{
		return this._faction;
	}
	public set faction(value: string) 
	{
		this._faction = value;
	}

	public get foregroundUrl(): string 
	{
		return this._foregroundUrl;
	}
	public set foregroundUrl(value: string) 
	{
		this._foregroundUrl = value;
	}

	public get backgroundUrl(): string
	{
		return this._backgroundUrl;
	}
	public set backgroundUrl(value: string)
	{
		this._backgroundUrl = value;
	}

	public get typeImageUrl(): string
	{
		return CardType[this._type];
	}

	constructor(		 
		private _backgroundUrl: string, 
		private _foregroundUrl: string,		
		private _type: string,
		private _tiers: CardTier[],
		private _faction?: string)
	{

	}
}
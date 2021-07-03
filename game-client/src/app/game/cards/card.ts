import { Resource } from "../entities/resource";

export enum CardType
{
	'Concealed' = 'Concealed',
	'Build' = 'Build',
	'Attack' = 'Attack'
}

export enum Faction
{
	"Battle",
	"EagleEye",
	"SunLight",
	"Espionage",
	"Science"
}

export interface CardInformation
{
	title: string;
	backgroundUrl: string;
	foregroundUrl: string;
	type: string;
	amount: number;	
	cost: Resource[];
	tier?: number;
	faction?: string[];
	description?: string;
}

export class Card
{
	public get title(): string 
	{
		return this._title;
	}
	public set title(value: string) 
	{
		this._title = value;
	}

	public get type(): string 
	{
		return this._type;
	}
	public set type(value: string) 
	{
		this._type = value;
	}

	public get factions(): string[]
	{
		return this._factions;
	}
	public set factions(value: string[]) 
	{
		this._factions = value;
	}

	public get description(): string
	{
		return this._description;
	}

	public get resources(): Resource[] 
	{
		return this._resources;
	}
	public set resources(value: Resource[]) 
	{
		this._resources = value;
	}

	public get tier(): number
	{
		return this._tier;
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
		return `assets/cards/types/${this.type}.png`;
	}

	public get factionImageUrls(): string[]
	{
		const urls: string[] = [];
		this.factions.forEach(faction =>
		{
			urls.push(`assets/cards/factions/${faction}.png`);
		});
		return urls;
	}

	public get id(): number
	{
		return this._id;
	}

	public get amount(): number
	{
		return this._amount;
	}

	private _title : string;
	private _backgroundUrl: string;
	private _foregroundUrl: string;		
	private _type: string;
	private _amount: number;
	private _resources: Resource[];
	private _tier?: number;
	private _factions?: string[];
	private _description: string;

	constructor(cardInformation: CardInformation, private _id: number)
	{
		this._title = cardInformation.title;
		this._backgroundUrl = cardInformation.backgroundUrl;
		this._foregroundUrl = cardInformation.foregroundUrl;
		this._type = cardInformation.type;
		this._amount = cardInformation.amount;
		this.resources = cardInformation.cost;
		this._tier = cardInformation.tier;
		this._description = cardInformation.description;
		this._factions = cardInformation.faction;
	}
}
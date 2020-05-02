export enum ResourceType
{
	Food,
	Gold,
	Population
}

export class Resource
{
	public get resourceIconSrc(): string
	{
		const root: string = 'assets/Icons/';
		let src: string;
		switch (this.resourceType) 
		{
			case ResourceType.Food:
			default:
				src = 'wheat.png';
				break;
			case ResourceType.Gold:
				src = 'gold.png';
				break;
			case ResourceType.Population:
				src = 'population.png';
				break;
		}
		return root + src;
	}

	public get $amount(): number
	{
		return this.amount;
	}

	public get $resourceType(): ResourceType
	{
		return this.resourceType;
	}

	constructor(private resourceType: ResourceType, private amount: number)
	{
	}
}

export class BuyableItemModel
{
	constructor(
		private name: string,
		private description: string,
		private cost: Resource[],
		private upkeep: Resource[] = [])
	{
	}

	public get $name(): string
	{
		return this.name;
	}

	public get $description(): string
	{
		return this.description;
	}

	private get path(): string
	{
		switch (this.name.toLowerCase())
		{
			case 'town':
				return 'villageSmall03.png';
			case 'village':
				return 'village02.png';
			case 'city':
				return 'walledCity.png';
		}
	}

	public get $icon(): string
	{
		return 'assets/Terrain_Medieval/Decor/' + this.path;
	}

	public get $cost(): Resource[]
	{
		return this.cost;
	}

	public get $upkeep(): Resource[]
	{
		return this.upkeep;
	}
}
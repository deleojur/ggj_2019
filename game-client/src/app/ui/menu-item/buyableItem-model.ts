export enum ResourceType
{
	Food,
	Gold,
	Population
}

export class resource
{
	public get resourceIconSrc(): string
	{
		const root: string = 'assets/Icons/';
		let src: string;
		switch (this.resourceType) 
		{
			case ResourceType.Food:
			default:
				src = 'food.png';
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

	constructor(private resourceType: ResourceType, private amount: number)
	{

	}
}

export class buyableItemModel
{
	constructor(private name: string, private description: string, private resources: resource[])
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
				return '';
			case 'village':
				return 'villageSmall03.png';
		}
	}

	public get $icon(): string
	{
		return 'assets/Terrain_Medieval/Decor/' + this.path;
	}

	public get $resources(): resource[]
	{
		return this.resources;
	}
}
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

	public set $amount(value: number)
	{
		this.amount = value;
	}

	public get $resourceType(): ResourceType
	{
		return this.resourceType;
	}

	constructor(private resourceType: ResourceType, private amount: number)
	{
	}
}
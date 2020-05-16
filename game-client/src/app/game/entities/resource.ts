export class Resource
{
	public get textureUrl(): string
	{
		return 'assets/resources/' + this.type + '.png';
	}

	constructor(public type: string, public amount: number)
	{
	}
}
export class cardModel
{
    private url: string;
    private name: string;
    private amount?: number;


    /**
     * Getter $url
     * @return {string}
     */
	public get $url(): string {
		return this.url;
	}

    /**
     * Getter $name
     * @return {string}
     */
	public get $name(): string {
		return this.name;
	}

    /**
     * Getter $amount
     * @return {number}
     */
	public get $amount(): number {
		return this.amount;
	}

    /**
     * Setter $url
     * @param {string} value
     */
	public set $url(value: string) {
		this.url = value;
	}

    /**
     * Setter $name
     * @param {string} value
     */
	public set $name(value: string) {
		this.name = value;
	}

    /**
     * Setter $amount
     * @param {number} value
     */
	public set $amount(value: number) {
		this.amount = value;
	}

    public constructor(url: string, name: string, amount?: number)
    {
        this.url = url;
        this.name = name;
        this.amount = amount;
    }
}
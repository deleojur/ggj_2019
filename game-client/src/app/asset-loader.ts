export class AssetLoader
{
	private static _instance: AssetLoader = null;

	constructor()
	{

	}

	public static get instance(): AssetLoader
	{
		if (this._instance === null)
		{
			this._instance = new AssetLoader();
		}

		return this._instance;
	}
}
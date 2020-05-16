import { Loader, Texture } from 'pixi.js';
import { EntityPrototype, EntityInformation } from './game/entities/entity';
import { WorldMap } from './game/grid/map-reader';
import { Resource } from './game/entities/resource';
import { EntityBehavior } from './game/entities/entity-behavior/entity-behavior';

export class AssetLoader
{
	private static _instance: AssetLoader = null;

	private _entityPrototypes: Map<string, EntityPrototype>;
	private _entityInformation: Map<string, EntityInformation>;


	private _textures: Map<string, Texture>;
	private _worldMap: WorldMap;

	public entityPrototype(name: string): EntityPrototype
	{
		return this._entityPrototypes.get(name);
	}

	public get entityInformation(): Map<string, EntityInformation>
	{
		return this._entityInformation;
	}

	public get worldMap(): WorldMap
	{
		return this._worldMap;
	}

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

	public getTexture(url: string): Texture
	{
		return this._textures.get(url);
	}

	private createEntityPrototypes(entities: EntityInformation[])
	{
		this._entityPrototypes = new Map<string, EntityPrototype>();
		this._entityInformation = new Map<string, EntityInformation>();

		entities.forEach(e =>
		{
			const texture: Texture = this._textures.get(e.textureUrl);
			[...e.cost, ...e.upkeep].forEach(res => 
			{				
				Object.setPrototypeOf(res, Resource.prototype);
			});

			const entityPrototype: EntityPrototype = new EntityPrototype(
				e.name, texture, new EntityBehavior());
			
			this._entityInformation.set(e.name, e);
			this._entityPrototypes.set(e.name, entityPrototype);
		});
	}

	private async loadTextures(loader: Loader, textures: string[]): Promise<void>
	{
		return new Promise(resolve =>
		{
			this._textures = new Map<string, Texture>();
			textures.forEach(textureUrl =>
			{
				loader.add(textureUrl);
			});

			loader.load((loader, resources) =>
			{
				textures.forEach(textureUrl =>
				{
					const texture: Texture = Texture.from(resources[textureUrl].data);
					this._textures.set(textureUrl, texture);
				});
				resolve();
			});
		});
	}

	public loadAssetsAsync(): Promise<void>
	{
		return new Promise(resolve => 
		{
			const loader: Loader = new Loader();
			const manifestUrl: string = 'assets/assets-manifest.json';
			const worldMapUrl: string = 'assets/map_1.json';

			loader.add(manifestUrl);
			loader.add(worldMapUrl);

			loader.load((loader, resources) => 
			{
				loader.reset();

				const textureUrls: string[] = resources[manifestUrl].data.textures;
				const entityInformation: EntityInformation[] = resources[manifestUrl].data.entities;
				this._worldMap = resources[worldMapUrl].data;

				this.loadTextures(loader, textureUrls).then(() =>
				{
					this.createEntityPrototypes(entityInformation);
					resolve();
				});
			});
		});
	}
}
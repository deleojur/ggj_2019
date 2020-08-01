import { Loader, Texture } from 'pixi.js';
import { EntityPrototype, EntityInformation, PrototypeInformation, BehaviorInformation, EntityType } from './game/entities/entity';
import { WorldMap } from './game/grid/map-reader';
import { Resource } from './game/entities/resource';

interface CommandIconsBackground
{
	build: string;
	upgrade: string;
	train: string;
	skill: string;
}

export class AssetLoader
{
	private static _instance: AssetLoader = null;

	private _entityPrototypes: Map<string, EntityPrototype>;
	private _entityInformation: Map<string, EntityInformation>;
	private _behaviorInformation: Map<string, BehaviorInformation>;

	private _textures: Map<string, Texture>;
	private _commandIconsBackgrounds: CommandIconsBackground;
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

	public getBehaviorInformation(name: string): BehaviorInformation
	{
		return this._behaviorInformation.get(name);
	}

	private setResourceClass(e: PrototypeInformation): void
	{
		[...e.cost || [], ...e.upkeep || []].forEach(res => 
		{				
			Object.setPrototypeOf(res, Resource.prototype);
		});
	}

	private createEntityBehaviors(e: EntityInformation): BehaviorInformation[]
	{
		const behaviors: BehaviorInformation[] = [];
		e.behaviors.forEach(b =>
		{
			behaviors.push(this._behaviorInformation.get(b));
		});

		return behaviors;
	}

	private createEntityPrototypes(entities: EntityInformation[])
	{
		this._entityPrototypes = new Map<string, EntityPrototype>();
		this._entityInformation = new Map<string, EntityInformation>();

		entities.forEach(e =>
		{
			this.setResourceClass(e);
			const typeName: string = e.entityType.charAt(0).toUpperCase() + e.entityType.slice(1);
			const entityType: EntityType = (<any>EntityType)[typeName];
			const entityPrototype: EntityPrototype = new EntityPrototype(
				e.name, entityType, e.textureUrl, this.createEntityBehaviors(e), e.upkeep);

			this._entityInformation.set(e.name, e);
			this._entityPrototypes.set(e.name, entityPrototype);
		});
	}

	private createBehaviorInformation(behaviorInformation: BehaviorInformation[]): void
	{
		this._behaviorInformation = new Map<string, BehaviorInformation>();
		behaviorInformation.forEach(behavior =>
		{
			this.setResourceClass(behavior);
			this._behaviorInformation.set(behavior.name, behavior);
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
				this._commandIconsBackgrounds = resources[manifestUrl].data.commandIconsBackground;
		
				const entityInformation: EntityInformation[] = resources[manifestUrl].data.entities;
				const behaviorInformation: BehaviorInformation[] = resources[manifestUrl].data.behaviors;
				this._worldMap = resources[worldMapUrl].data;

				this.loadTextures(loader, textureUrls).then(() =>
				{
					this.createBehaviorInformation(behaviorInformation);
					this.createEntityPrototypes(entityInformation);
					resolve();
				});
			});
		});
	}

	public commandIconBackground(type: string): string
	{
		for (let [key, value] of Object.entries(this._commandIconsBackgrounds))
		{
			if(key === type)
			{
				return value;
			}
		}
	}
}
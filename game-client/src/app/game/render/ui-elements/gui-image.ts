import { GUIImageOptions } from './gui-image';
import { GUIObject, GUIObjectOptions, LoadAssets } from './gui-object';
import { Texture, Sprite, Loader } from 'pixi.js';

export interface GUIImageOptions extends GUIObjectOptions
{
    texture_url: string;
};

export class GUIImage extends GUIObject implements LoadAssets
{
    private textureUrl: string;
    private sprite: Sprite;

    public get assetsToLoad(): string[]
    {
        return [this.textureUrl];
    }

    public loadCompleted(data: Map<string, PIXI.LoaderResource>): void
    {
        const texture: Texture = Texture.from(data.get(this.textureUrl).name);
        this.sprite = new Sprite(texture);
        this.addChild(this.sprite);
    }

    public init(options: GUIImageOptions)
    {
        this.textureUrl = options.texture_url;
        super.init(options);
    }
}
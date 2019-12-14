import { GUIButtonOptions } from './gui-button';
import { Texture, Sprite } from 'pixi.js';
import { GUIObject, GUIObjectOptions, LoadAssets } from './gui-object';

export interface GUIButtonOptions extends GUIObjectOptions
{
    image_url_normal: string;
    image_url_hover: string;
    image_url_clicked: string;
    image_url_disabled: string;
};
export class GUIButton extends GUIObject implements LoadAssets
{
    private textureUrls: string[];
    private textures: Map<string, Texture>;
    private sprite: Sprite;
    private buttonOptions: GUIButtonOptions;
    private isdown: boolean;
    private isover: boolean;

    public get assetsToLoad(): string[]
    {
        return this.textureUrls;
    }

    public loadCompleted(data: Map<string, PIXI.LoaderResource>): void
    {
        this.buttonOptions = this.options as GUIButtonOptions;
        this.textures = new Map<string, Texture>();
        data.forEach(e => 
        {
            const texture: Texture = Texture.from(e.name);
            this.textures.set(e.name, texture);
        });
        this.sprite = new Sprite(this.textures.get(this.buttonOptions.image_url_normal));
        this.addChild(this.sprite);

        this.sprite.interactive = true;
        this.sprite.on('mousedown', () => this.onButtonDown())
            .on('touchstart', () => this.onButtonDown())
            .on('mouseup', () => this.onButtonUp())
            .on('touchend', () => this.onButtonUp())
            .on('mouseupoutside', () => this.onButtonUp())
            .on('touchendoutside', () => this.onButtonUp())
            .on('mouseover', () => this.onButtonOut())
            .on('mouseout', () => this.onButtonOut());
    }    

    public init(options: GUIButtonOptions)
    {
        super.init(options);

        this.textureUrls = [
            options.image_url_clicked, options.image_url_disabled, options.image_url_hover, options.image_url_normal];
    }

    private onButtonDown(): void
    {
        this.isdown = true; 
        this.sprite.texture = this.textures.get(this.buttonOptions.image_url_clicked);
    }

    onButtonUp(): void
    {
        this.isdown = false;    
        if (this.isover)
        {
            this.sprite.texture = this.textures.get(this.buttonOptions.image_url_hover);
        }
        else
        {
            this.sprite.texture = this.textures.get(this.buttonOptions.image_url_normal);
        }
    }

    onButtonOver(): void
    {
        this.isover = true;    
        if (!this.isdown)
        {
            this.sprite.texture = this.textures.get(this.buttonOptions.image_url_hover);
        }
    }
    
    onButtonOut(): void
    {
        this.isover = false;    
        if (!this.isdown)
        {
            this.sprite.texture = this.textures.get(this.buttonOptions.image_url_normal);
        }
    }    
};
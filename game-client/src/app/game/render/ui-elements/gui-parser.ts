import { GUIWindow } from './gui-window';
import { GUIButton, GUIButtonOptions } from './gui-button';
import { GUIText } from './gui-text';
import { GUIObject, GUIObjectOptions, LoadAssets } from './gui-object';
import { GUIImage } from './gui-image';
import { Loader } from 'pixi.js';

export class GuiParser
{
    guiElementsByName : { [name: string] : new () => GUIObject } = 
    { 
        "window" : GUIWindow, 
        "button" : GUIButton,
        "image" : GUIImage,
        "text" : GUIText
    };
    private createInstance(guiElement : new() => GUIObject) : GUIObject
    {
        return new guiElement();
    }

    /**
     * Reads the parsed JSON data and subtracts and builds the components.
     * @param data the parsed JSON data. Children is an array with recursive data types.
     */
    public parseElement(data: GUIObjectOptions): GUIObject
    {
        const guiElement: GUIObject = this.createInstance(this.guiElementsByName[data.component_type]);
        data.children.forEach((child: GUIObjectOptions) => 
        {
            guiElement.addChild(this.parseElement(child));
        });
        guiElement.init(data);
        return guiElement;
    };

    private isLoadAssets(arg: any): arg is LoadAssets
    {
        return arg && arg.assetsToLoad && typeof(arg.assetsToLoad) === 'object' 
        && arg.loadCompleted && typeof(arg.loadCompleted) === 'function'; 
    }

    public loadAssets(loader: Loader, guiElement: GUIObject)
    {
        if (this.isLoadAssets(guiElement))
        {
            const loadAssets: LoadAssets = guiElement as LoadAssets;
            loader.add(loadAssets.assetsToLoad);
        }
        guiElement.children.forEach((child: GUIObject) =>
        {
            this.loadAssets(loader, child);
        });
    }

    public onAssetsLoaded(resource: Partial<Record<string, PIXI.LoaderResource>>, guiElement: GUIObject)
    {
        if (this.isLoadAssets(guiElement))
        {
            const loadAssets: LoadAssets = guiElement as LoadAssets;
            const data: Map<string, PIXI.LoaderResource> = new Map<string, PIXI.LoaderResource>();
            guiElement.assetsToLoad.forEach((url: string) =>
            {
                data.set(url, resource[url]);
            });
            loadAssets.loadCompleted(data);
        }
        guiElement.children.forEach((child: GUIObject) =>
        {
            this.onAssetsLoaded(resource, child);
        });
    }
}
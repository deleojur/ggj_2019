import * as PIXI from 'pixi.js';
import { GuiParser } from './ui-elements/gui-parser';
import { GUIObjectOptions, GUIObject } from './ui-elements/gui-object';
import { Viewport } from 'pixi-viewport';

export class UserInterface extends PIXI.Container
{
    private guiParser: GuiParser;
    
    constructor()
    {
        super();
        this.guiParser = new GuiParser();
        this.init();
    }

    public init(): void
    {
        const loader: PIXI.Loader = new PIXI.Loader();
        loader.add('assets/UI/window/window.json');
        loader.load((loader, resource) =>
        {
            const data = resource['assets/UI/window/window.json'].data;
            const parent: GUIObject = this.guiParser.parseElement(data);
            loader.reset();
            this.guiParser.loadAssets(loader, parent);
            loader.load((loader, resource) =>
            {
                this.addChild(parent);
                this.guiParser.onAssetsLoaded(resource, parent);
            });
        });
    }
}
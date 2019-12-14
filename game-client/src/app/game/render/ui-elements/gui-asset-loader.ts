import * as PIXI from 'pixi.js';

export class GUIAssetLoader
{
    private _resources: Map<string, PIXI.LoaderResource>;
    private _resourceUrls: string[];

    loadCompleted(resources: Map<string, PIXI.LoaderResource>): void
    {
        this._resources = resources;
    }

    public set resourceUrls(values: string[])
    {
        this._resourceUrls = values;
    }

    public get resourceUrls(): string[]
    {
        return this._resourceUrls;
    }

    public getResource(name: string): PIXI.LoaderResource
    {
        return this._resources.get(name);
    }
}
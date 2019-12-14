import * as PIXI from 'pixi.js';

export interface GUIObjectOptions
{
    id: string,
    component_type: string,
    position: { x: number, y: number },
    anchor: 
    { 
        x: number, //0 = left, 1 = right
        y: number  //0 = top, 1 = bottom
    }, 
    scale:
    {
        x: number, //< 0 flips horizontally
        y: number //< 0 flips vertically
    }
    angle: number, //rotation in degrees
    children: GUIObjectOptions[]    
}

export interface LoadAssets
{
    readonly assetsToLoad: string[];
    loadCompleted(data: Map<string, PIXI.LoaderResource>): void;
};

export class GUIObject extends PIXI.Container
{
    protected options: GUIObjectOptions;
    
    public init(options: GUIObjectOptions): void
    {
        this.options = options;
        this.position = new PIXI.Point(options.position.x, options.position.y);
        this.scale = new PIXI.Point(options.scale.x, options.scale.y);
        this.pivot = new PIXI.Point(options.anchor.x, options.anchor.y);
        this.angle = options.angle;
    }
}
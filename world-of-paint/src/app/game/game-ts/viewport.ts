import { Vector } from 'vector2d/src/Vec2D';
import { iGame } from './../game.component';
import { Viewport } from 'pixi-viewport';

export interface iViewport
{
    readonly $position: Vector;
    readonly $scale: Vector;
}

export class ViewportManager implements iViewport
{    
    private viewport: Viewport;
    private pixi: PIXI.Application;    

    constructor(private game: iGame)
    {
        this.pixi = game.$pixi;
        this.initViewport();
        this.game.$render.subscribe(() => this.render());
    }

    public get $viewport(): Viewport
    {
        return this.viewport;
    }

    private initViewport(): void
    {
        const viewport = new Viewport
        ({
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
            worldWidth: 1000,
            worldHeight: 1000,         
            interaction: this.pixi.renderer.plugins.interaction // the interaction module is important for wheel to work properly when renderer.view is placed or scaled
        });
        this.pixi.stage.addChild(viewport);

        viewport
            .drag({ factor: 1 })
            .clamp({ direction: 'all' })
            .decelerate({ friction: .00001, minSpeed: 0 })
            .pinch({ noDrag: true })
            .wheel();

        this.viewport = viewport;
    }

    public get $position(): Vector
    {
        const x: number = this.viewport.x;
        const y: number = this.viewport.y;
        return new Vector(x, y);
    }

    public get $scale(): Vector
    {
        const x: number = this.viewport.scale.x;
        const y: number = this.viewport.scale.y;
        return new Vector(x, y);
    }

    public render(): void
    {
        this.pixi.renderer.clear();
        this.pixi.renderer.render(this.viewport);        
    }
}
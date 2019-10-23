import { iGrid } from './grid';
import { Vector } from 'vector2d/src/Vec2D';
import { iGame } from './../game.component';
import { Viewport } from 'pixi-viewport';

export interface iViewport
{
    readonly $position: Vector;
    readonly $scale: Vector;
    snapToPosition(x: number, y: number): void;
}

export class ViewportManager implements iViewport
{    
    private viewport: Viewport;
    private pixi: PIXI.Application;
    private grid: iGrid;

    constructor(private game: iGame)
    {
        this.pixi = game.$pixi;
        this.grid = game.$grid;
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
            worldWidth: this.grid.$width,
            worldHeight: this.grid.$height,         
            interaction: this.pixi.renderer.plugins.interaction // the interaction module is important for wheel to work properly when renderer.view is placed or scaled
        });
        this.pixi.stage.addChild(viewport);

        viewport
            .drag({ factor: 1 })
            .pinch({ noDrag: true })
            .wheel()            
            .clamp({ direction: 'all' })
            .clampZoom({ 
                minWidth: 500, maxWidth: 173.20508075688772 * 10 + 86, 
                minHeight: 500, maxHeight: 1500 })
            .decelerate({ friction: .00001, minSpeed: 0 });

        this.viewport = viewport;
    }

    public snapToPosition(x: number, y: number): void
    {
        this.viewport.snap(x, y, { time: 500, ease: 'easeInOutSine', removeOnComplete: true, removeOnInterrupt: true });
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
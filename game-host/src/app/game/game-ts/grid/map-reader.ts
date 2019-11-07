import { Viewport } from 'pixi-viewport';
import { iViewport } from './../viewport';
import * as PIXI from 'pixi.js';
import { Grid, Hex } from 'honeycomb-grid';
import { Cell } from './grid';

export interface TileProperty
{
    name: string;
    type: string;
    value: any;
};

interface Tile
{
    id: number;
    texture: PIXI.Texture;
    properties?: TileProperty[];
};

export interface Icon
{
    gid: number;
    sprite: PIXI.Sprite;
    x: number;
    y: number;
}

export class MapReader
{
    private worldMap: any;
    private tileLayers: number[][] = [];
    private objectLayer: Icon[] = [];
    private worldTiles: Map<number, Tile> = new Map<number, Tile>();

    public get icons(): Icon[]
    {
        return this.objectLayer;
    }

    constructor()
    {
        
    }

    public loadWorldMap(onready: (width: number, height: number) => void): void
    {
        const loader: PIXI.Loader = new PIXI.Loader();
        const worldMapUrl: string = 'assets/map_1.json';
        loader.add(worldMapUrl);
        loader.load((loader, resources) =>
        {
            this.worldMap = resources[worldMapUrl].data;
            return onready(this.worldMap.width, this.worldMap.height);
        });
    }

    public parseWorldMap(grid: Grid<Hex<Cell>>): void
    {
        const uniqueTileIds: Set<number> = this.parseLayers();
        this.parseTilesets(uniqueTileIds);
        this.mapGrid(grid);
    }

    private parseLayers(): Set<number>
    {
        const layers = this.worldMap.layers;
        const uniqueTileIds: Set<number> = new Set<number>();
        layers.forEach(layer => 
        {
            if (layer.type === 'tilelayer')
            {
                this.tileLayers.push([]);
                const index = this.tileLayers.length - 1;
                layer.data.forEach(id => 
                {
                    this.tileLayers[index].push(id);
                });

                const imageIds: number[] = [...new Set<number>(layer.data)];
                imageIds.forEach(id =>
                {
                    uniqueTileIds.add(id);
                });
            } else if (layer.type === 'objectgroup')
            {
                layer.objects.forEach(obj =>
                {
                    uniqueTileIds.add(obj.gid);
                    this.objectLayer.push(obj);
                });
            }
        });
        return uniqueTileIds;
    }

    private parseTilesets(uniqueTileIds: Set<number>): void
    {        
        const tilesets = this.worldMap.tilesets;
        tilesets.forEach(tileset => 
        {
            const firstgid = tileset.firstgid;
            tileset.tiles.forEach(tile =>
            {
                const id: number = firstgid + tile.id;                
                if (uniqueTileIds.has(id))
                {
                    const texture = PIXI.Texture.from('assets/' + tile.image);
                    this.worldTiles.set(id, { id: id, texture: texture, properties: tile.properties || [] });
                }
            });
        });
    };

    private mapGrid(grid: Grid<Hex<Cell>>): void
    {
        for (let i: number = 0; i < this.tileLayers.length; i++)
        {
            const layer: number[] = this.tileLayers[i];
            for (let j: number = 0; j < layer.length; j++)
            {
                const id = layer[j];
                const tile: Tile = this.worldTiles.get(id);

                if (tile)
                {
                    const sprite: PIXI.Sprite = new PIXI.Sprite(tile.texture);
    
                    grid[j].sprites.push(sprite);
                    tile.properties.forEach((property: TileProperty) =>
                    {
                        grid[j].properties.push(property);
                    });
                }
            }
        }

        this.objectLayer.forEach(obj =>
        {
            const tile: Tile = this.worldTiles.get(obj.gid);
            const sprite: PIXI.Sprite = new PIXI.Sprite(tile.texture);
            obj.sprite = sprite;
        });
    }
}
import * as PIXI from 'pixi.js';
import { Grid, Hex } from 'honeycomb-grid';
import { Cell } from './grid';

interface Tile
{
    id: number;
    imageUrl: string;
};

export class MapReader
{
    private worldMap: any;
    private worldMapTileIds: number[][] = [];
    private worldTiles: Map<number, PIXI.Texture> = new Map<number, PIXI.Texture>();

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
        const uniqueTiles: Set<Tile> = this.parseTilesets(uniqueTileIds);
        this.loadImages(uniqueTiles);
        this.mapGrid(grid);
    }

    private parseLayers(): Set<number>
    {
        const layers = this.worldMap.layers;
        const uniqueTileIds: Set<number> = new Set<number>();
        layers.forEach(layer => 
        {
            this.worldMapTileIds.push([]);
            if (layer.type === 'tilelayer')
            {
                const index = this.worldMapTileIds.length - 1;
                layer.data.forEach(id => 
                {
                    this.worldMapTileIds[index].push(id);
                });

                const imageIds: number[] = [...new Set<number>(layer.data)];
                imageIds.forEach(id =>
                {
                    uniqueTileIds.add(id);
                });
            }   
        });
        return uniqueTileIds;
    }

    private parseTilesets(uniqueTileIds: Set<number>): Set<Tile>
    {        
        const tilesets = this.worldMap.tilesets;
        const uniqueTiles: Set<Tile> = new Set<Tile>();
        tilesets.forEach(tileset => 
        {
            const firstgid = tileset.firstgid;
            tileset.tiles.forEach(tile =>
            {
                const id: number = firstgid + tile.id;                
                if (uniqueTileIds.has(id))
                {
                    uniqueTiles.add({ id: id, imageUrl: tile.image });
                }
            });
        });
        return uniqueTiles;
    };

    private loadImages(uniqueTiles: Set<Tile>): void
    {
        uniqueTiles.forEach((e: Tile) => 
        {
            const texture = PIXI.Texture.from('assets/' + e.imageUrl);
            this.worldTiles.set(e.id, texture);
        });
    };

    private mapGrid(grid: Grid<Hex<Cell>>): void
    {
        for (let i: number = 0; i < this.worldMapTileIds.length; i++)
        {
            const layers: number[] = this.worldMapTileIds[i];
            for (let j: number = 0; j < layers.length; j++)
            {
                const id = layers[j];
                const sprite = new PIXI.Sprite(this.worldTiles.get(id));
                grid[j].sprites.push(sprite);
            }
        }
    }
}
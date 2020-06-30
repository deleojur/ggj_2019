import * as PIXI from 'pixi.js';
import { Grid, Hex } from 'honeycomb-grid';
import { Cell } from './grid';
import { AssetLoader } from 'src/app/asset-loader';

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

export interface Object
{
    gid: number;
    x: number;
    y: number;

    properties?: TileProperty[];
    sprite?: PIXI.Sprite;
}

export interface WorldMap
{
	width: number;
	height: number;
	tilesets: any[];
	layers: any[];
}

export class MapReader
{
    private worldMap: WorldMap;
    private tileLayers: number[][] = [];
    private iconLayer: Object[] = [];
    private hexArtLayer: Object[] = [];
	private worldTiles: Map<number, Tile> = new Map<number, Tile>();

    public get icons(): Object[]
    {
        return this.iconLayer;
    }

    public get hexUnderLayer(): Object[]
    {
        return this.hexArtLayer;
    }

    constructor()
    {
        
    }

    public parseWorldMap(grid: Grid<Hex<Cell>>): void
    {
		const uniqueTileIds: Set<number> = this.parseLayers();
		this.parseTilesets(uniqueTileIds);
		this.mapGrid(grid);
    }

    private parseLayers(): Set<number>
    {
		this.worldMap = AssetLoader.instance.worldMap;
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
                    
                    if (layer.name === 'Hex Under Layer')
                    {
                        this.hexArtLayer.push(obj);
                    } else 
                    {
                        this.iconLayer.push(obj);
                    }
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
					const textureUrl: string = 'assets/' + tile.image;
					const texture: PIXI.Texture = AssetLoader.instance.getTexture(textureUrl);
                    this.worldTiles.set(id, { id: id, texture: texture, properties: tile.properties || [] });
                }
            });
        });
    };

    private mapTileLayers(grid: Grid<Hex<Cell>>)
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
    }

    private mapObjectLayers(layer: Object[]): void
    {
        layer.forEach(obj =>
        {
            if (obj.properties)
            {
                obj.properties = Array.from(obj.properties);
            }

            const tile: Tile = this.worldTiles.get(obj.gid);
            if (tile)
            {
                const sprite: PIXI.Sprite = new PIXI.Sprite(tile.texture);
                obj.sprite = sprite;
            }
        });
    }

    private mapGrid(grid: Grid<Hex<Cell>>): void
    {
        this.mapTileLayers(grid);
        this.mapObjectLayers(this.iconLayer);
        this.mapObjectLayers(this.hexArtLayer);
    }
}
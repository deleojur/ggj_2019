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

export interface HexID
{
	name: string;
	id: number;
	x: number;
	y: number;
}

export interface Entity
{
	amount?: number;
	allegiances?: number;
	id: number;
	name: string;
	x: number;
	y: number;
}

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
    private _entityLayer: Entity[] = [];
	private _hexIdLayer: HexID[] = [];
    private _hexUnderLayer: Object[] = [];
	private _hexOverLayer: Object[] = [];
	
	private worldTiles: Map<number, Tile> = new Map<number, Tile>();

    public get entities(): Entity[]
    {
        return this._entityLayer;
    }

    public get hexUnderLayer(): Object[]
    {
        return this._hexUnderLayer;
    }

	public get hexOverLayer(): Object[]
	{
		return this._hexOverLayer;
	}

	public get hexIdLayer(): HexID[]
	{
		return this._hexIdLayer;
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

	private parseTileLayer(layer: any, uniqueTileIds: Set<number>): void
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
	}

	private parseObjectLayer(layer: any, uniqueTileIds: Set<number>): void
	{

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
                this.parseTileLayer(layer, uniqueTileIds);
            } else if (layer.type === 'objectgroup')
            {	          
                layer.objects.forEach(obj =>
                {
                    if (layer.name === 'Hex Under Layer')
                    {
                        this._hexUnderLayer.push(obj);
						uniqueTileIds.add(obj.gid);
                    } else if (layer.name === 'Hex Over Layer')
                    {
                        this._hexOverLayer.push(obj);
						uniqueTileIds.add(obj.gid);
                    } else if (layer.name === 'Entity Layer')
                    {
						const amount: number = this.getPropertyValueAsNumber(obj, 'amount');
						obj.amount = amount;
						const allegiances: number = this.getPropertyValueAsNumber(obj, 'allegiances');
						obj.allegiances = allegiances;
                        this._entityLayer.push(obj);
                    } else if (layer.name === 'Hex ID Layer')
					{						
						const id: number = this.getPropertyValueAsNumber(obj, 'id');
						const hexId: HexID = { x: obj.x, y: obj.y, id: id, name: obj.name };						
						this._hexIdLayer.push(hexId);
					}
                });
            }
        });
        
        return uniqueTileIds;
    }

	private getPropertyValueAsNumber(obj, propertyName: string): number
	{
		if (obj.properties)
		{
			const properties: any = obj.properties.find((obj) => 
			{ 
				const keys = Object.keys(obj);
				const val = obj['name'];
				return val === propertyName;
			});
			if (!properties)
			{
				return -1;
			}
			return properties.value;
		}
		return -1;
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
    
                    grid[j].sprites.push({sprite: sprite, zIndex: i});
                    tile.properties.forEach((property: TileProperty) =>
                    {
						grid[j].properties.push(property);
                    });
                }
            }
        }
    }

	private mapEntityLayer(layer: Entity[]): void
	{
		layer.forEach(entity =>
		{
			
		});
	}

    private mapObjectLayer(layer: Object[]): void
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
        this.mapObjectLayer(this._hexUnderLayer);
		this.mapEntityLayer(this._entityLayer);
		this.mapObjectLayer(this._hexOverLayer);
    }
}
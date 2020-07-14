import { Entity } from '../entities/entity';
import { Hex } from 'honeycomb-grid';
import { Cell, GridManager } from './grid';
import { EntityManager } from '../entities/entity-manager';
import { Structure } from '../entities/structure';
import { Unit } from '../entities/unit';
import { Container, Graphics } from 'pixi.js';
import { Point } from 'honeycomb-grid';
import { GameManager } from '../game-manager';

interface Outline
{
	corner1: Point;
	corner2: Point;
	hex: Hex<Cell>;
}

export class GridStrategy
{
	private entityContainer: Container;
	private selectedCellsGraphics: Graphics;
	protected entityManager: EntityManager;
	protected graphics: Graphics;
	protected gameManager: GameManager;
	protected grid: GridManager;

	constructor()
	{
	}

	public init(graphics: Graphics): void
	{
		this.gameManager = GameManager.instance;
		this.grid = this.gameManager.grid;
		this.graphics = graphics;
		this.selectedCellsGraphics = new Graphics();
		
		this.entityManager = new EntityManager();
		this.entityContainer = new Container();
		this.entityContainer.sortableChildren = true;

		this.graphics.addChild(this.selectedCellsGraphics);
		this.graphics.addChild(this.entityContainer);
	}

	private setZIndex(hex: Hex<Cell>, entity: Entity): void
	{
		entity.zIndex = hex.y;
		if (entity instanceof Unit)
		{
			entity.zIndex++;
		}
	}

	public getEntitiesAtHexOfOwner(hex: Hex<Cell>, id: string): Entity[]
	{
		const entities: Entity[] = this.getEntitiesAtHex(hex);
		for (let i = entities.length - 1; i > -1; i--)
		{
			if (entities[i].owner !== id)
			{
				entities.splice(i, 1);
			}
		}
		return entities;
	}

	public moveEntityToHex(entity: Entity, from: Hex<Cell>, to: Hex<Cell>): void
	{
		this.entityManager.moveEntityToHex(entity, from, to);
		entity.moveToHex(to);
		this.setZIndex(to, entity);
	}

	public addEntity(hex: Hex<Cell>, entity: Entity): void
	{
		this.entityManager.addEntity(hex, entity);
		this.entityContainer.addChild(entity);
		this.setZIndex(hex, entity);
	}

	public createEntity(hex: Hex<Cell>, owner: string, entityName: string): Entity
	{
		const entity: Entity = this.entityManager.createEntity(hex, owner, entityName);
		this.addEntity(hex, entity);
		return entity;
	}

	public removeEntity(hex: Hex<Cell>, entity: Entity): void
	{
		this.entityManager.removeEntity(hex, entity);
		this.entityContainer.removeChild(entity);
	}

	private getEdgeCorners(hexagons: Hex<Cell>[]): Outline[]
    {
        const outline: Outline[] = [];
        let neighbor: Hex<Cell> = null;
        hexagons.forEach((hex) =>
        {
            const neighbors: Hex<Cell>[] = this.grid.getNeighbors(hex);
            for(let n = 0; n < neighbors.length; n++)
            {
                neighbor = neighbors[n];
				const point: Point = hex.toPoint();
				const corners = hex.corners().map(corner => corner.add(point));
				
                if(hexagons.indexOf(neighbor) === -1)
                {
                    const p1 = corners[n];
					const p2 = corners[(n + 1) % 6];
                    outline.push({ hex: hex, corner1: p1, corner2: p2 });
                }
            }
        });
        return outline;
	}

	public renderSelectedCellsOutline(selection: Hex<Cell>[], color: number): void
	{
		this.selectedCellsGraphics.lineStyle(5, color, 1, 0.5);
		const outline: Outline[] = this.getEdgeCorners(selection);
        for (let i = 0; i < outline.length; i++)
        {
            const corner1 = outline[i].corner1;
            const corner2 = outline[i].corner2;
            // move the "pen" to the first corner
            this.selectedCellsGraphics.moveTo(corner1.x, corner1.y);

            // draw lines to the other corners
            this.selectedCellsGraphics.lineTo(corner2.x, corner2.y);
		}
		this.selectedCellsGraphics.lineStyle(0);
	}

	public clearSelectedCells(): void
	{
		this.selectedCellsGraphics.clear();
	}

	public getEntitiesAtHex(hex: Hex<Cell>): Entity[]
	{
		return this.entityManager.getEntitiesAtHex(hex);
	}

	public isStructure(hex: Hex<Cell>): boolean
	{
		const entities: Entity[] = this.entityManager.getEntitiesAtHex(hex);
		for (let i: number = 0; i < entities.length; i++)
		{
			const entity: Entity = entities[i];
			if (entity instanceof Structure)
			{
				return true;
			}
		}		
		return false;
	}	
}
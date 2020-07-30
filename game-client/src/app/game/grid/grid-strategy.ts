import { Entity } from '../entities/entity';
import { Hex } from 'honeycomb-grid';
import { Cell, GridManager } from './grid';
import { EntityManager } from '../entities/entity-manager';
import { Structure } from '../entities/structure';
import { Unit } from '../entities/unit';
import { Container, Graphics } from 'pixi.js';
import { Point } from 'honeycomb-grid';
import { GameManager } from '../game-manager';
import { ClientData } from '../states/request-data';
import { StateHandlerService } from '../states/state-handler.service';
import { Vector } from 'vector2d';

export enum RenderType
{
	StraightLine,
	DottedLine
}

interface Outline
{
	corner1: Point;
	corner2: Point;
	hex: Hex<Cell>;
}

export abstract class GridStrategy
{
	private entityContainer: Container;
	private selectedCellsGraphics: Graphics;
	protected entityManager: EntityManager;
	protected graphics: Graphics;
	protected gameManager: GameManager;
	protected grid: GridManager;
	protected clients: ClientData[];
	private static _autoIncrement: number = 0;
	private _entitiesByGuids: Map<number, Entity>;

	protected startEntities: Map<number, { hex: Hex<Cell>, entityName: string }[]>

	constructor(protected stateHandler: StateHandlerService)
	{
		this.startEntities = new Map<number, { hex: Hex<Cell>, entityName: string }[]>();
		this._entitiesByGuids = new Map<number, Entity>();
	}

	public init(graphics: Graphics): void
	{
		this.gameManager = GameManager.instance;
		this.grid = this.gameManager.grid;
		this.graphics = graphics;
		this.selectedCellsGraphics = new Graphics();
		
		this.entityManager = new EntityManager();
		this.entityManager.init();
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

	public getEntityByGuid(guid: number): Entity
	{
		return this._entitiesByGuids.get(guid);
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

	public get maxNumberOfPlayers(): number
	{
		return this.startEntities.size;
	}

	protected getColor(color: string): number
	{
		return parseInt(color.replace('#', '0x'));
	}

	public renderEntitiesByOwnerColor(): void
	{
		this.clearSelectedCells();
		const occupiedHexes: Map<string, Hex<Cell>[]> = this.entityManager.getAllOccupiedHexesOfOwner();
		this.clients.forEach(client =>
		{
			const hexes: Hex<Cell>[] = occupiedHexes.get(client.id);
			this.renderSelectedCellsOutline(hexes, this.getColor(client.color), RenderType.StraightLine);
		});
		this.renderCommandsByOwnerColor();
	}

	protected abstract renderCommandsByOwnerColor(): void;

	private setEntityGuid(entity: Entity): Entity
	{
		entity.guid = GridStrategy._autoIncrement;
		this._entitiesByGuids.set(GridStrategy._autoIncrement, entity);
		GridStrategy._autoIncrement++;
		return entity;
	}

	public createStartEntities(clients: ClientData[]): void
	{
		this.clients = clients;
		clients.forEach(client =>
		{
			const startPositions: { hex: Hex<Cell>, entityName: string }[] = this.startEntities.get(client.startingPosition);
			startPositions.forEach(startPosition =>
			{
				const entity: Entity = this.createEntity(startPosition.hex, client.id, startPosition.entityName);
				this.setEntityGuid(entity);
			});			
		});
	}

	public addStartEntityPrototype(playerIndex: number, hex: Hex<Cell>, entityName: string): void
	{
		if (!this.startEntities.has(playerIndex))
		{
			this.startEntities.set(playerIndex, []);
		}
		this.startEntities.get(playerIndex).push({ hex: hex, entityName: entityName });
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

	public renderSelectedCellsOutline(selection: Hex<Cell>[], color: number, renderType: RenderType): void
	{
		this.selectedCellsGraphics.lineStyle(7, color, 1, 0.5);
		const outline: Outline[] = this.getEdgeCorners(selection);
        for (let i = 0; i < outline.length; i++)
        {
			switch (renderType)
			{
				case RenderType.DottedLine:
					this.renderDottedLine(outline[i]);
					break;
				case RenderType.StraightLine:
					this.renderStraightLine(outline[i]);
					break;
			}
		}
		this.selectedCellsGraphics.lineStyle(0, 0);
	}

	private renderStraightLine(outline: Outline): void
	{
		const corner1 = outline.corner1;
		const corner2 = outline.corner2;
		
		// move the "pen" to the first corner
		this.selectedCellsGraphics.moveTo(corner1.x, corner1.y);

		// draw lines to the other corners
		this.selectedCellsGraphics.lineTo(corner2.x, corner2.y);
	}

	private renderDottedLine(outline: Outline): void
	{
		const corner1 = outline.corner1;
		const corner2 = outline.corner2;
		
		const v1: Vector = new Vector(corner1.x, corner1.y);
		const v2: Vector = new Vector(corner2.x, corner2.y);

		const vdir = v2.clone().subtract(v1);
		const dist: number = vdir.clone().magnitude();
		const step: number = dist / 3;
		const length: number = dist / 6;
		const dif: number = (step - length) / 2;

		const vdirn = vdir.clone().normalise();
		//const vdirs: Vector = vdir.clone().multiplyByScalar(step) as Vector;

		for (let j: number = 0; j < 3; j ++)
		{
			let from = v1.clone().add(vdirn.clone().multiplyByScalar(step * j + dif * j));
			let to = from.clone().add(vdirn.clone().multiplyByScalar(length));

			// move the "pen" to the first corner
			this.selectedCellsGraphics.moveTo(from.x, from.y);

			// draw lines to the other corners
			this.selectedCellsGraphics.lineTo(to.x, to.y);
		}
	}

	public clearSelectedCells(): void
	{
		this.selectedCellsGraphics.clear();
	}

	public getEntitiesAtHex(hex: Hex<Cell>): Entity[]
	{
		return this.entityManager.getEntitiesAtHex(hex).slice();
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
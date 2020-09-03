import { Entity } from '../entities/entity';
import { Hex } from 'honeycomb-grid';
import { Cell, GridManager } from './grid';
import { EntityManager } from '../entities/entity-manager';
import { Structure } from '../entities/structure';
import { Unit } from '../entities/unit';
import { Container, Graphics, Point as pPoint } from 'pixi.js';
import { Point } from 'honeycomb-grid';
import { GameManager } from '../game-manager';
import { ClientData } from '../states/request-data';
import { StateHandlerService } from '../states/state-handler.service';
import { Vector, VectorConstructable } from 'vector2d';
import { TurnCommand, TurnInformation } from '../turns/turn-command';

export enum RenderType
{
	StraightLine,
	DottedLine
}

interface Outline
{
	corner1: Vector;
	corner2: Vector;
	hex: Hex<Cell>;
}

export abstract class GridStrategy
{
	private entityContainer: Container;
	private selectedCellsGraphics: Graphics;
	private pathGraphics: Graphics;
	protected entityManager: EntityManager;
	protected graphics: Graphics;
	protected gameManager: GameManager;
	protected grid: GridManager;
	protected _clients: ClientData[];
	private static _autoIncrement: number = 0;
	private _entitiesByGuids: Map<number, Entity>;

	protected startEntities: Map<number, { hex: Hex<Cell>, entityName: string }[]>

	constructor(protected stateHandler: StateHandlerService)
	{
		this.startEntities = new Map<number, { hex: Hex<Cell>, entityName: string }[]>();
		this._entitiesByGuids = new Map<number, Entity>();
	}

	public get StateHandler(): StateHandlerService
	{
		return this.stateHandler;
	}

	public init(graphics: Graphics, pathGraphics: Graphics): void
	{
		this.gameManager = GameManager.instance;
		this.grid = this.gameManager.grid;
		this.graphics = graphics;
		this.selectedCellsGraphics = new Graphics();
		this.pathGraphics = pathGraphics;
		
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
		const occupiedHexes: Map<string, Hex<Cell>[]> = this.entityManager.getAllOccupiedHexes();
		this._clients.forEach(client =>
		{
			const hexes: Hex<Cell>[] = occupiedHexes.get(client.id).filter(hex =>
			{
				if (GameManager.instance.gridStrategy.isStructure(hex))
				{
					return true;
				}

				const turns: TurnInformation[] = GameManager.instance.turnSystem.getTurnInformation(hex);
				for (let i: number = 0; i < turns.length; i++)
				{
					const turnInformation: TurnInformation = turns[i];
					if (turnInformation.originEntity instanceof Unit)
					{
						return false;
					}
				}
				return true;
			});
			this.renderCellsOutline(hexes, this.getColor(client.color), client.startingPosition, RenderType.StraightLine);
		});
		this.renderCommandsByOwnerColor();
	}

	protected abstract renderCommandsByOwnerColor(): void;

	public setEntityGuid(entity: Entity, guid: number): Entity
	{
		entity.guid = guid;
		this._entitiesByGuids.set(guid, entity);
		return entity;
	}

	protected setEntityGuidAutoIncrement(entity: Entity): Entity
	{
		entity.guid = GridStrategy._autoIncrement;
		this._entitiesByGuids.set(GridStrategy._autoIncrement, entity);
		GridStrategy._autoIncrement++;
		return entity;
	}

	public createStartEntities(clients: ClientData[]): void
	{
		this._clients = clients;
		clients.forEach(client =>
		{
			const startPositions: { hex: Hex<Cell>, entityName: string }[] = this.startEntities.get(client.startingPosition);
			startPositions.forEach(startPosition =>
			{
				const entity: Entity = this.createEntity(startPosition.hex, client.id, startPosition.entityName);
				this.addEntity(startPosition.hex, entity)
				this.setEntityGuidAutoIncrement(entity);
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

	public addEntity(hex: Hex<Cell>, entity: Entity): Entity
	{
		this.entityManager.addEntity(hex, entity);
		this.entityContainer.addChild(entity);
		this.setZIndex(hex, entity);
		return entity;
	}

	public createEntity(hex: Hex<Cell>, owner: string, entityName: string): Entity
	{
		const entity: Entity = this.entityManager.createEntity(hex, owner, entityName);
		return entity;
	}

	public removeEntity(hex: Hex<Cell>, entity: Entity): void
	{
		if (entity)
		{
			this.entityManager.removeEntity(hex, entity);
			this.entityContainer.removeChild(entity);
		}
	}

	private getEdgeCorners(hexagons: Hex<Cell>[], clientIndex: number): Outline[]
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
				const c: Point = hex.center().add(point);
				const corners = hex.corners().map(corner => corner.add(point));
				
                if(hexagons.indexOf(neighbor) === -1)
                {
                    const p1 = corners[n];
					const p2 = corners[(n + 1) % 6];

					const center: Vector = new Vector(c.x, c.y);
					const corner1: Vector = new Vector(p1.x, p1.y);
					const corner2: Vector = new Vector(p2.x, p2.y);
					const dir1: Vector = center.clone().subtract(corner1).normalise().multiplyByScalar(clientIndex * 5) as Vector;
					const dir2: Vector = center.clone().subtract(corner2).normalise().multiplyByScalar(clientIndex * 5) as Vector;
					
					corner1.add(dir1);
					corner2.add(dir2);

                    outline.push({ hex: hex, corner1: corner1, corner2: corner2 });
                }
            }
        });
        return outline;
	}

	public renderCellsOutline(selection: Hex<Cell>[], color: number, clientIndex: number, renderType: RenderType): void
	{
		this.selectedCellsGraphics.lineStyle(7, color, 1, 0.5);
		const outline: Outline[] = this.getEdgeCorners(selection, clientIndex);
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

	public renderTurnCommandPath(turnInformation: TurnInformation[], color: number, clientIndex: number)
	{
		this.pathGraphics.lineStyle(7, color, 1, 0.5);
		this.pathGraphics.beginFill(color);

		const paths: Set<Hex<Cell>> = new Set<Hex<Cell>>();
		turnInformation.forEach(turn =>
		{
			const path: Hex<Cell>[] = turn.path;
			if (path)
			{
				for (let i: number = 0; i < path.length; i++)
				{
					const hex: Hex<Cell> = path[i];

					if (i < path.length - 1)
					{
						const hexTo: Hex<Cell> = path[i + 1];
						const pos1: Point = hex.toPoint().add(hex.center());
						const pos2: Point = hexTo.toPoint().add(hexTo.center());

						const vec1: Vector = new Vector(pos1.x, pos1.y);
						const vec2: Vector = new Vector(pos2.x, pos2.y);
						const blaat: Vector = vec2.clone().subtract(vec1).normalise() as Vector;
						const blaat2: Vector = vec1.clone().add(blaat.clone().multiplyByScalar(90)) as Vector;
						const blaat3: Vector = vec1.clone().add(blaat.clone().multiplyByScalar(150)) as Vector;
						const blaat4: Vector = vec1.clone().add(blaat.clone().multiplyByScalar(130)) as Vector;
						const perp1: Vector = new Vector(-blaat.y, blaat.x).multiplyByScalar(8).add(blaat4);
						const perp2: Vector = new Vector(blaat.y, -blaat.x).multiplyByScalar(8).add(blaat4);


						this.pathGraphics.moveTo(blaat2.x, blaat2.y);
						this.pathGraphics.lineTo(blaat3.x, blaat3.y);
						
						this.pathGraphics.drawPolygon([
							new pPoint(blaat3.x, blaat3.y), 
							new pPoint(perp1.x, perp1.y),
							new pPoint(perp2.x, perp2.y)]);
					}
					paths.add(hex);
				}
			}
		});

		this.pathGraphics.lineStyle(0);
		this.pathGraphics.endFill();
		this.renderCellsOutline(Array.from(paths), color, clientIndex, RenderType.DottedLine);
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
		const steps = 4;
		const corner1 = outline.corner1;
		const corner2 = outline.corner2;
		
		const v1: Vector = new Vector(corner1.x, corner1.y);
		const v2: Vector = new Vector(corner2.x, corner2.y);

		const vdir = v2.clone().subtract(v1);
		const dist: number = vdir.clone().magnitude();
		const step: number = dist / steps;
		const length: number = dist / 6;
		const dif: number = (step - length) / 2;

		const vdirn = vdir.clone().normalise();
		//const vdirs: Vector = vdir.clone().multiplyByScalar(step) as Vector;

		for (let j: number = 0; j < steps; j ++)
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
		this.pathGraphics.clear();
	}

	public getEntitiesAtHex(hex: Hex<Cell>): Entity[]
	{
		return this.entityManager.getEntitiesAtHex(hex).slice();
	}

	public getAllEntities(): Map<string, Entity[]>
	{
		return this.entityManager.getAllEntities();
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

	public createEntityFromCommand(turnCommand: TurnCommand): Entity
	{
		const targetEntity: Entity = turnCommand.turnInformation.targetEntity;
		targetEntity.owner = turnCommand.owner;
		if (targetEntity.guid === -1)
		{
			return this.setEntityGuidAutoIncrement(targetEntity);
		} else
		{
			this._entitiesByGuids.set(targetEntity.guid, targetEntity);
		}
		return targetEntity;
	}
}
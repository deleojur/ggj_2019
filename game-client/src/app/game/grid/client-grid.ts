import { ClientStateHandler } from '../states/client-states/client-state-handler';
import { GridStrategy, RenderType } from './grid-strategy';
import { Hex } from 'honeycomb-grid';
import { Cell } from './grid';
import { Entity } from '../entities/entity';
import { Graphics, Polygon } from 'pixi.js';
import { Queue } from 'simple-fifo-queue';
import { TurnCommand, TurnInformation } from '../turns/turn-command';
import { GameManager } from '../game-manager';

interface Path
{
	hex: Hex<Cell>;
	dist: number;
};

export class GridClient extends GridStrategy
{
	private validCellsGraphics: Graphics;

	constructor(private _clientStateHandler: ClientStateHandler)
	{
		super(_clientStateHandler);
		this.validCellsGraphics = new Graphics(); //shows red/green shade depending on whether a cell is valid to move to/build on
	}

	public get clientStateHandler(): ClientStateHandler
	{
		return this._clientStateHandler;
	}

	public get clientColor(): number
	{
		return this._clientStateHandler.getColor();
	}

	public init(gridGraphics: Graphics, pathGraphics: Graphics): void
	{
		super.init(gridGraphics, pathGraphics);
		gridGraphics.addChild(this.validCellsGraphics);
	}

	public selectEntities(hex: Hex<Cell>): Entity[]
	{
		return [];
	}

	public getBuildableCells(hex: Hex<Cell>): Hex<Cell>[]
	{
		const neighbors: Hex<Cell>[] = this.grid.getNeighbors(hex);
		const validCells: Hex<Cell>[] = [];
		neighbors.forEach(n =>
		{			
			if (n.buildable && !this.isStructure(n))
			{
				n.parent = hex;
				validCells.push(n);
			}
		});
		return validCells;
	}

	public getWalkableCells(hex: Hex<Cell>, radius: number): Hex<Cell>[]
	{
		const checkedCells: Hex<Cell>[] = [];
		const uncheckedCells: Queue<Path> = new Queue<Path>();
		const road: Hex<Cell>[] = this.grid.getWalkableNeighbors(hex);
		road.forEach(node =>
		{
			node.parent = hex;
		});
		
		let current: Path = { hex: hex, dist: 0 };
		do
		{
			const neighbors: Hex<Cell>[] = this.grid.getRoadNeighbors(current.hex);
			neighbors.forEach(n =>
			{
				if (checkedCells.indexOf(n) === -1)
				{
					checkedCells.push(n);
					if (current.dist + 1 <= radius)
					{
						//if (!this.isStructure(n))
						{
							uncheckedCells.Push({ hex: n, dist: current.dist + 1 });
						}
						if (road.indexOf(n) === -1)
						{
							n.parent = current.hex;
							road.push(n);
						}
					}
				}
			});
			checkedCells.push(current.hex);
			if (uncheckedCells.Size() === 0)
			{
				break;
			}
			current = uncheckedCells.Front();
			uncheckedCells.Pop();
		} while (true);
		return road;
	}

	public renderValidCells(validCells: Hex<Cell>[]): Hex<Cell>[]
	{
		 //= this.getValidCells(hex, type);
		this.renderSelectedCellsOutline(validCells, 0xfada5e, RenderType.StraightLine);

		validCells.forEach(cell =>
		{
			const polygons: Polygon[] = this.grid.getPolygon([cell]);
			this.validCellsGraphics.beginFill(0x00ff00, 0.45);
			polygons.forEach(polygon => 
			{
				this.validCellsGraphics.drawPolygon(polygon);
			});		
			this.validCellsGraphics.endFill();
		});
		return validCells;
	}

	protected renderCommandsByOwnerColor(): void
	{
		const color: number = this.clientColor;
		const turnInformation: TurnInformation[] = GameManager.instance.clientTurnSystem.getAllTurnInformation();
		this.renderTurnCommandPath(turnInformation, color);
	}

	public clearValidCells(): void
	{
		this.validCellsGraphics.clear();
	}
}
import { ClientStateHandler } from '../states/client-states/client-state-handler';
import { GridStrategy, RenderType } from './grid-strategy';
import { Hex } from 'honeycomb-grid';
import { Cell } from './grid';
import { Entity } from '../entities/entity';
import { Graphics, Polygon } from 'pixi.js';
import { Queue } from 'simple-fifo-queue';

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

	public init(graphics: Graphics): void
	{
		super.init(graphics);
		graphics.addChild(this.validCellsGraphics);
	}

	public selectEntities(hex: Hex<Cell>): Entity[]
	{
		return [];
	}

	private getBuildableCells(hex: Hex<Cell>): Hex<Cell>[]
	{
		const neighbors: Hex<Cell>[] = this.grid.getNeighbors(hex);
		const validCells: Hex<Cell>[] = [];
		neighbors.forEach(n =>
		{			
			if (n.buildable && !this.isStructure(n))
			{
				validCells.push(n);
			}
		});
		return validCells;
	}

	private getValidCells(hex: Hex<Cell>, type: string): Hex<Cell>[]
	{
		switch (type)
		{
			case "build":
				return this.getBuildableCells(hex);
			
			case "move":
				return this.getWalkableCells(hex, 3);
		}
	}

	private getWalkableCells(hex: Hex<Cell>, radius: number): Hex<Cell>[]
	{
		const checkedCells: Hex<Cell>[] = [];
		const uncheckedCells: Queue<{ hex: Hex<Cell>, dist: number }> = new Queue<{ hex: Hex<Cell>, dist: number }>();
		const road: Hex<Cell>[] = [];
		let current: { hex: Hex<Cell>, dist: number } = { hex: hex, dist: 0 };
		do
		{
			const neighbors: Hex<Cell>[] = this.grid.getNeighbors(current.hex);
			neighbors.forEach(n =>
			{
				if (checkedCells.indexOf(n) === -1)
				{
					checkedCells.push(n);
					if ((current.dist + 1 === 1 && n.walkable) ||
						(current.dist + 1 <= radius && n.road && hex.road))
					{
						if (!this.isStructure(n))
						{
							uncheckedCells.Push({ hex: n, dist: current.dist + 1 });
						}
						road.push(n);
					}
				}
			});
			checkedCells.push(current.hex);
			current = uncheckedCells.Front();
			uncheckedCells.Pop();
		} while (!uncheckedCells.Empty());
		return road;
	}

	public renderValidCells(hex: Hex<Cell>, type: string): Hex<Cell>[]
	{
		const validCells: Hex<Cell>[] = this.getValidCells(hex, type);
		this.renderSelectedCellsOutline(validCells, 0xfada5e, RenderType.DottedLine);

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

	public clearValidCells(): void
	{
		this.validCellsGraphics.clear();
	}
}
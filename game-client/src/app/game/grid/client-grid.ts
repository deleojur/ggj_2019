import { ClientStateHandler } from '../states/client-states/client-state-handler';
import { GridStrategy, RenderType } from './grid-strategy';
import { Hex } from 'honeycomb-grid';
import { Cell } from './grid';
import { Entity } from '../entities/entity';
import { Graphics, Polygon } from 'pixi.js';
import { TurnInformation } from '../turns/turn-command';
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
		return this._clientStateHandler.getClientColor();
	}

	private get clientIndex(): number
	{
		return this._clientStateHandler.clientIndex;
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

	public renderValidCells(validCells: Hex<Cell>[]): Hex<Cell>[]
	{
		 //= this.getValidCells(hex, type);
		this.renderCellsOutline(validCells, 0xfada5e, RenderType.StraightLine);

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
		this.renderTurnCommandPath(turnInformation, color, this.clientIndex);
	}

	public clearValidCells(): void
	{
		this.validCellsGraphics.clear();
	}
}
import { Entity, } from './entity';
import { Point, Sprite } from 'pixi.js';
import { Hex } from 'honeycomb-grid';
import { Cell } from '../grid/grid';
import { GameManager } from '../game-manager';

export class Unit extends Entity
{
	protected init(): void
	{
		const game: GameManager = GameManager.instance;

		this.displayUnit(game);
		this.displayPowericon(game);

		this.moveToHex(this._location);
	}

	private displayUnit(game: GameManager): void
	{
		const foreground: Sprite = game.createSprite('assets/units/frames/unit_background.png', new Point(0, 60), new Point(0.5, 0.5));
		const unit_mask: Sprite = game.createSprite('assets/units/frames/unit_mask.png', new Point(0, 60), new Point(0.5, 0.5));
		const unit: Sprite = game.createSprite(this._prototype.textureUrl, new Point(0, 50), new Point(0.45, 0.45));
		
		unit.mask = unit_mask;
		this.addChild(unit_mask);
		this.addChild(foreground);
		this.addChild(unit);
	}

	public moveToHex(hex: Hex<Cell>): void
	{
		const pos = hex.center().add(hex.toPoint());
		this.position = new Point(pos.x, pos.y);
	}
}
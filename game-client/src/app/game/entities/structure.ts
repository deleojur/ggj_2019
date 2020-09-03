import { Entity } from './entity';
import { Point, Sprite } from 'pixi.js';
import { GameManager } from '../game-manager';
import { Hex } from 'honeycomb-grid';
import { Cell } from '../grid/grid';

export class Structure extends Entity
{
	protected init(): void
	{
		const structure: Sprite = GameManager.instance.createSprite(this._prototype.textureUrl, new Point(0, 0), new Point(1, 1));
		this.addChild(structure);
		this.displayPowericon(GameManager.instance);

		this.moveToHex(this._location);
	}

	public moveToHex(hex: Hex<Cell>): void
	{
		const pos = hex.center().add(hex.toPoint());
		this.position = new Point(pos.x, pos.y - 64);
	}
}
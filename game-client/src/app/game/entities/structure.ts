import { Entity } from './entity';
import { Point, Sprite } from 'pixi.js';
import { GameManager } from '../game-manager';

export class Structure extends Entity
{
	protected initialise(): void
	{
		const pos = this._location.center().add(this._location.toPoint());
		const structure: Sprite = GameManager.instance.createSprite(this._prototype.textureUrl, new Point(0, 0), new Point(1, 1));
		this.addChild(structure);

		this.position = new Point(pos.x, pos.y - 64);
	}
}
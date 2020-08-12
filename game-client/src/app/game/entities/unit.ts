import { Entity, EntityPrototype } from './entity';
import { Point, Sprite, Texture, Graphics, BLEND_MODES } from 'pixi.js';
import { Hex } from 'honeycomb-grid';
import { Cell } from '../grid/grid';
import { AssetLoader } from 'src/app/asset-loader';
import { GameManager } from '../game-manager';

export class Unit extends Entity
{
	protected init(): void
	{
		const game: GameManager = GameManager.instance;

		const background: Sprite = game.createSprite('assets/UI/button/r_bg_yellow.png', new Point(0, 30), new Point(0.1, 0.1));
		const foreground: Sprite = game.createSprite('assets/units/frames/temp.png', new Point(0, 30), new Point(1.0, 1.0));
		const round_mask: Sprite = game.createSprite('assets/UI/button/round_mask.png', new Point(0, 30), new Point(0.13, 0.1));
		const command: Sprite = game.createSprite(this._prototype.textureUrl, new Point(0, 35), new Point(0.45, 0.45));

		command.mask = round_mask;
		this.addChild(round_mask);
		this.addChild(background);
		this.addChild(command);
		this.addChild(foreground);
		this.moveToHex(this._location);
	}

	public moveToHex(hex: Hex<Cell>): void
	{
		const pos = hex.center().add(hex.toPoint());
		this.position = new Point(pos.x, pos.y);
	}
}
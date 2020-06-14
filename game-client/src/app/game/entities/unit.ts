import { Entity, EntityPrototype } from './entity';
import { Point, Sprite, Texture, Graphics, BLEND_MODES } from 'pixi.js';
import { Hex } from 'honeycomb-grid';
import { Cell } from '../grid/grid';
import { AssetLoader } from 'src/app/asset-loader';
import { GameManager } from '../game-manager';

export class Unit extends Entity
{
	protected initialise(): void
	{
		const game: GameManager = GameManager.instance;
		const background: Sprite = game.createSprite('assets/UI/button/window/w_bg_blue.PNG', new Point(0, 0), new Point(0.13, 0.13));
		const window_mask: Sprite = game.createSprite('assets/UI/button/window/window_mask.PNG', new Point(0, 0), new Point(0.13, 0.13));
		const unit: Sprite = game.createSprite(this._prototype.textureUrl, new Point(0, 30), new Point(0.55, 0.55));
		const foreground: Sprite = game.createSprite('assets/UI/button/window/Window_frame.PNG', new Point(0, 0), new Point(0.13, 0.13));
		unit.mask = window_mask;
		
		this.addChild(window_mask);
		this.addChild(background);		
		this.addChild(unit);
		this.addChild(foreground);
		this.moveToHex(this._location);
	}

	public moveToHex(hex: Hex<Cell>): void
	{
		const pos = hex.center().add(hex.toPoint());
		this.position = new Point(pos.x, pos.y);
	}
}
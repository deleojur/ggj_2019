import { Entity, EntityPrototype } from './entity';
import { Point, Sprite, Texture, Graphics, BLEND_MODES, Text } from 'pixi.js';
import { Hex } from 'honeycomb-grid';
import { Cell } from '../grid/grid';
import { AssetLoader } from 'src/app/asset-loader';
import { GameManager } from '../game-manager';

export class Unit extends Entity
{
	protected init(): void
	{
		const game: GameManager = GameManager.instance;

		const foreground: Sprite = game.createSprite('assets/units/frames/unit_background.png', new Point(0, 60), new Point(0.5, 0.5));
		const unit_mask: Sprite = game.createSprite('assets/units/frames/unit_mask.png', new Point(0, 60), new Point(0.5, 0.5));
		const unit_atk_art1: Sprite = game.createSprite('assets/units/frames/unit_atk_art.png', new Point(20, 110), new Point(0.35, 0.35));
		const unit_atk_art2: Sprite = game.createSprite('assets/units/frames/unit_atk_art.png', new Point(-20, 110), new Point(0.35, 0.35));
		const unit_health: Sprite = game.createSprite('assets/units/frames/unit_health.png', new Point(0, 120), new Point(0.3, 0.3));
		const unit: Sprite = game.createSprite(this._prototype.textureUrl, new Point(0, 50), new Point(0.45, 0.45));
		const text: Text = new Text('2', { fontFamily: 'GotischeMajuskel', fontSize: 72, fill: 0xff0000, align: 'center' });
		text.anchor = new Point(0.5, 0.5);
		text.position = new Point(0, 110);
		unit_atk_art1.angle = 45;
		unit_atk_art2.angle = 315;

		unit.mask = unit_mask;
		this.addChild(unit_mask);
		this.addChild(foreground);
		this.addChild(unit);
		this.addChild(unit_atk_art1);
		this.addChild(unit_atk_art2);
		this.addChild(unit_health);
		this.addChild(text);

		this.moveToHex(this._location);		
	}

	public moveToHex(hex: Hex<Cell>): void
	{
		const pos = hex.center().add(hex.toPoint());
		this.position = new Point(pos.x, pos.y);
	}
}
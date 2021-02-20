import { Hex } from "honeycomb-grid";
import { Container, Point, Sprite } from "pixi.js";
import { GameManager } from "../../game-manager";
import { Cell } from "../../grid/grid";

export class Entity extends Container
{
	constructor(private id: string, protected _location: Hex<Cell>)
	{
		super();
		this.moveToHex(this._location);

		const sprite: Sprite = GameManager.instance.createSprite(`assets/Tile_Entities/${id}.png`, new Point(0, 0), new Point(1, 1));
		const frameBg: Sprite = GameManager.instance.createSprite('assets/UI/button/r_bg_blue.png', new Point(0, 120), new Point(0.12, 0.12));
		const frameFg: Sprite = GameManager.instance.createSprite('assets/units/frames/round_frame.png', new Point(0, 120), new Point(1.2, 1.2));
		const icon: Sprite = GameManager.instance.createSprite(`assets/resources/${id}.png`, new Point(0, 120), new Point(0.4, 0.4));
		const iconMask: Sprite = GameManager.instance.createSprite('assets/UI/button/round_mask.png', new Point(0, 120), new Point(0.12, 0.12));
		icon.mask = iconMask;
		
		this.addChild(sprite);
		this.addChild(iconMask);
		this.addChild(frameBg);
		this.addChild(icon);
		this.addChild(frameFg);
	}

	public moveToHex(hex: Hex<Cell>): void
	{
		const pos = hex.center().add(hex.toPoint());
		this.position = new Point(pos.x, pos.y - 64);
	}
}
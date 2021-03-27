import { Hex } from "honeycomb-grid";
import { Container, Point, Sprite, Text } from "pixi.js";
import { GameManager } from "../../game-manager";
import { Cell } from "../../grid/grid";
import { Entity } from "../../grid/map-reader";

export class TileEntity extends Container
{
	constructor(private entity: Entity, protected _location: Hex<Cell>)
	{
		super();
		this.moveToHex(this._location);

		const sprite: Sprite = GameManager.instance.createSprite(`assets/Tile_Entities/${entity.name}.png`, new Point(0, 0), new Point(1, 1));
		const frameBg: Sprite = GameManager.instance.createSprite('assets/UI/button/r_bg_blue.png', new Point(0, 120), new Point(0.12, 0.12));
		const frameFg: Sprite = GameManager.instance.createSprite('assets/units/frames/round_frame.png', new Point(0, 120), new Point(1.2, 1.2));
		const icon: Sprite = GameManager.instance.createSprite(`assets/resources/${entity.name}.png`, new Point(0, 120), new Point(0.4, 0.4));
		const iconMask: Sprite = GameManager.instance.createSprite('assets/UI/button/round_mask.png', new Point(0, 120), new Point(0.12, 0.12));
		icon.mask = iconMask;
		
		this.addChild(sprite);
		this.addChild(iconMask);
		this.addChild(frameBg);
		this.addChild(icon);
		this.addChild(frameFg);	

		if (entity.amount != -1)
		{
			this.addAmount(entity.amount);
		}

		if (entity.allegiances != -1)
		{
			this.addAllegiances(entity.allegiances);
		}
	}

	private addAmount(amount: number): void
	{	
		const background: Sprite = GameManager.instance.createSprite('assets/units/frames/nail2.png', new Point(50, 75), new Point(0.71, 0.71));
		const foreground: Sprite = GameManager.instance.createSprite('assets/units/frames/map_frame_top2.png', new Point(49, 71), new Point(0.3, 0.3));
		const amountText: Text = GameManager.instance.createText(new Point(55, 65), 75, amount.toString(), 0x0);

		this.addChild(background);
		this.addChild(foreground);
		this.addChild(amountText);
	}

	private addAllegiances(allegiances: number): void
	{
		const allegianceLeft: Sprite = GameManager.instance.createSprite('assets/units/frames/allegiance_background.png', new Point(-75, 50), new Point(0.35, 0.35));
		const allegianceTop: Sprite = GameManager.instance.createSprite('assets/units/frames/allegiance_background.png', new Point(0, 0), new Point(0.35, 0.35));
		const allegianceRight: Sprite = GameManager.instance.createSprite('assets/units/frames/allegiance_background.png', new Point(75, 50), new Point(0.35, 0.35));
		this.addChild(allegianceLeft);		
		this.addChild(allegianceRight);

		switch (allegiances)
		{
			case 1:
				this.addChild(allegianceTop);
				break;
			case 2:
				this.addChild(allegianceLeft);		
				this.addChild(allegianceRight);
				break;
			case 3:
				this.addChild(allegianceLeft);		
				this.addChild(allegianceRight);
				this.addChild(allegianceTop);
				break;
		}
	}

	public moveToHex(hex: Hex<Cell>): void
	{
		const pos = hex.center().add(hex.toPoint());
		this.position = new Point(pos.x, pos.y - 64);
	}
}
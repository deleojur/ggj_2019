import { Hex } from 'honeycomb-grid';
import { Cell } from '../grid/grid';
import { Sprite, Container, Texture } from 'pixi.js';
import { Entity } from '../entities/entity';
import { AssetLoader } from 'src/app/asset-loader';

export interface TurnInformation
{
	originEntity: Entity; //the entity before the turn was initiated.
	targetEntity: Entity; //the entity after the turn was initiated.
	textureUrl: string; //icon that appears when the move isn't final yet for indication.
	destroysSelf: boolean;
	originCell: Hex<Cell>;
	targetCell: Hex<Cell>;
}

export class TurnCommand extends Sprite
{
	//this is the place where the command originates.	
	private _owner: string;
	private _actionIcon: Sprite;
	
	constructor(owner: string, public turnInformation: TurnInformation)
	{		
		super();
		this.texture = AssetLoader.instance.getTexture(turnInformation.textureUrl);
	}
}
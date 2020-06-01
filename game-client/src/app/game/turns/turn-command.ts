import { Hex } from 'honeycomb-grid';
import { Cell } from '../grid/grid';
import { Sprite, Container, Texture, Point } from 'pixi.js';
import { Entity } from '../entities/entity';
import { AssetLoader } from 'src/app/asset-loader';
import { Resource } from '../entities/resource';

export interface TurnInformation
{
	originEntity: Entity; //the entity before the turn.
	targetEntity: Entity; //the entity after the turn is played.
	iconTextureUrl: string; //icon that appears when the move isn't final yet for indication.
	originCell: Hex<Cell>; //the cell before the turn.
	targetCell?: Hex<Cell>; //the cell after the turn is played.
	cost: Resource[]; //the cost (used to refund if canceled).
	upkeep?: Resource[];
}

export class TurnCommand extends Sprite
{
	//this is the place where the command originates.	
	private _owner: string;
	
	constructor(owner: string, public turnInformation: TurnInformation)
	{		
		super(AssetLoader.instance.getTexture(turnInformation.iconTextureUrl));
	}
}
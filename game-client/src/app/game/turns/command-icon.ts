import { Container, Texture, Sprite, Point } from 'pixi.js';
import { GameManager } from '../game-manager';
import { AssetLoader } from 'src/app/asset-loader';
import { TurnInformation } from './turn-command';

export class CommandIcon extends Container
{
	constructor(turnInformation: TurnInformation)
	{
		super();

		this.createCommandIcon(turnInformation);
	}

	private createCommandIcon(turnInformation: TurnInformation): void
	{
		const game: GameManager = GameManager.instance;
		const assets: AssetLoader = AssetLoader.instance;
		const backgroundUrl: string = assets.commandIconBackground(turnInformation.behaviorInformation.type);
		const commandUrl: string = turnInformation.behaviorInformation.commandIconTextureUrl;

		const background: Sprite = game.createSprite(backgroundUrl, new Point(0, 0), new Point(0.12, 0.12));
		const foreground: Sprite = game.createSprite('assets/UI/button/ring_frame.PNG', new Point(0, 0), new Point(0.12, 0.12));
		const round_mask: Sprite = game.createSprite('assets/UI/button/round_mask.png', new Point(0, 0), new Point(0.12, 0.12));
		const command: Sprite = game.createSprite(commandUrl, new Point(0, 3), new Point(0.35, 0.35));

		command.mask = round_mask;
		this.addChild(round_mask);
		this.addChild(background);
		this.addChild(command);
		this.addChild(foreground);
	}
}
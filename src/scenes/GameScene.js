
import AnimatedTiles from 'phaser-animated-tiles/dist/AnimatedTiles.min.js';
import io from 'socket.io-client';
import gyro from '../helpers/gyro.min.js'
window.socket = io('http://145.28.233.153:4567');

socket.on('connect', function (data)
{
    console.log('Connected!');
});
  
socket.on('close_game', function()
{
    console.log('You need to reconnect!');
});

class GameScene extends Phaser.Scene
{
    constructor()
    {
        super({
            key: 'GameScene'
        });

    }

    preload()
    {
        this.load.scenePlugin('animatedTiles', AnimatedTiles, 'animatedTiles', 'animatedTiles');
    }

    create()
    {
        var self = this;

        var graphics = this.add.graphics({ lineStyle: { width: 2, color: window.background_color }, fillStyle: { color: window.background_color } });
        var rect = new Phaser.Geom.Rectangle();
        var square = new Phaser.Geom.Rectangle();
        rect.width = 1000;
        rect.height = 1000;
        var area = Phaser.Geom.Rectangle.Area(rect);
        square.width = square.height = Math.sqrt(area);
        graphics.fillRectShape(square);
        graphics.fillRectShape(rect);

        this.move_button = this.add.image(window.innerWidth / 2, 125, 'red_button', 0).setInteractive();
        this.move_icon = this.add.image(window.innerWidth / 2, 125, 'move', 0).setInteractive();
        this.move_button.on('pointerdown', function()
        {
            self.moving = true;
        });
        this.move_button.on('pointerup', function()
        {
            self.moving = false;
        });
        this.move_icon.on('pointerdown', function()
        {
            self.moving = true;
        });
        this.move_icon.on('pointerup', function()
        {
            self.moving = false;
        });
        
        this.move_button.scaleX = 0.3;
        this.move_button.scaleY = 0.3;
        this.move_icon.scaleX = 0.3;
        this.move_icon.scaleY = 0.3;

        this.input.addPointer();
        this.input.addPointer();

        this.shoot_button = this.add.image(window.innerWidth / 2, window.innerHeight - 125, 'red_button', 0).setInteractive();
        this.shoot_icon = this.add.image(window.innerWidth / 2, window.innerHeight - 125, 'shoot', 0).setInteractive();
        this.shoot_button.on('pointerdown', function()
        {
            self.shooting = true;
        });
        this.shoot_button.on('pointerup', function()
        {
            self.shooting = false;
        });
        this.shoot_icon.on('pointerdown', function()
        {
            self.shooting = true;
        });
        this.shoot_icon.on('pointerup', function()
        {
            self.shooting = false;
        });

        this.shoot_button.scaleX = 0.3;
        this.shoot_button.scaleY = 0.3;
        this.shoot_icon.scaleX = 0.3;
        this.shoot_icon.scaleY = 0.3;

        gyro.frequency = 10;
		// start gyroscope detection
        gyro.startTracking(function(o)
        {
            o.moving = self.moving;
            o.shooting = self.shooting;
            socket.emit('player_input', o);
        });
    }
}

export default GameScene;

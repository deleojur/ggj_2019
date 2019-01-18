
import AnimatedTiles from 'phaser-animated-tiles/dist/AnimatedTiles.min.js';
import io from 'socket.io-client';
window.socket = io('http://192.168.178.150:4567');

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
    constructor(test)
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
        
    }
}

export default GameScene;

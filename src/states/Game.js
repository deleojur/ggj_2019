/* globals __DEV__ */
import Phaser from 'phaser'
import Mushroom from '../sprites/Mushroom'
import lang from '../lang'
import io from 'socket.io-client';
let socket = io('http://localhost:4567');

socket.on('connect', function (data) {
  console.log('Connected!');
});

socket.on('message', function (data) 
{
    console.log('some data has arrived:', data);
});

export default class extends Phaser.State {

  init() { }
  preload() { }

  create() {
    const bannerText = lang.text('welcome')
    let banner = this.add.text(this.world.centerX, this.game.height - 80, bannerText, {
      font: '40px Bangers',
      fill: '#77BFA3',
      smoothed: false
    })

    banner.padding.set(10, 16)
    banner.anchor.setTo(0.5)

    this.mushroom = new Mushroom({
      game: this.game,
      x: this.world.centerX,
      y: this.world.centerY,
      asset: 'mushroom'
    })

    document.getElementById('player_connect').addEventListener('click',this.connectToGame);

    this.game.add.existing(this.mushroom);
    
  }

  connectToGame()
  {
      var name = document.getElementById('player_name').value;
      socket.emit('join_game', {message:name});
  }
}

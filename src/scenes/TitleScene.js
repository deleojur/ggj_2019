import FormUtil from '../helpers/FormUtil'

class TitleScene extends Phaser.Scene {
    
    constructor(test) {
        super({
            key: 'TitleScene'
        });
    }
    preload() {
        window.game = this.game;
    }
    create() {
        this.formUtil = new FormUtil({
            scene: this,
            rows: 11,
            cols: 11
        });

        var container = document.getElementById('username_container');

        this.formUtil.scaleToGameW("username_error", 1);
        this.formUtil.scaleToGameH("username_error", .25);
        this.formUtil.placeElementAt(93, "username_error", true);
        var error = document.getElementById('username_error');

        this.formUtil.scaleToGameW("username_submit", .5);
        this.formUtil.scaleToGameH("username_submit", .1);
        this.formUtil.placeElementAt(71, 'username_submit', true);

        var button = document.getElementById('username_submit');
        button.addEventListener("click", function()
        {
            socket.emit('join_game');   
        });

        socket.on('error_alreadyJoined', function()
        {
            error.innerHTML = 'You already joined the game!';
        });

        socket.on('error_usernameTaken', function()
        {
            error.innerHTML = 'That name has been taken.';
        });

        socket.on('error_gameNotStarted', function() 
        {
            error.innerHTML = 'The game has not started yet.';
        });

        socket.on('success_joinedGame', function(bg_color)
        {
            window.background_color = bg_color;
            error.innerHTML = 'Joining game...';
            container.removeChild(button);
            container.removeChild(error);
            game.scene.start('GameScene');
        });
    }
}

export default TitleScene;

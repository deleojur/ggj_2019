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

        this.formUtil.scaleToGameW("username_label", 1);
        this.formUtil.scaleToGameH("username_label", .25);
        this.formUtil.placeElementAt(5, "username_label", true);
        var label = document.getElementById('username_label');

        this.formUtil.scaleToGameW("username_error", 1);
        this.formUtil.scaleToGameH("username_error", .25);
        this.formUtil.placeElementAt(93, "username_error", true);
        var error = document.getElementById('username_error');

        this.formUtil.scaleToGameW("username_input", .5);
        this.formUtil.scaleToGameH("username_input", .1);
        this.formUtil.placeElementAt(38, 'username_input', true);
        var input = document.getElementById('username_input');

        this.formUtil.scaleToGameW("username_submit", .5);
        this.formUtil.scaleToGameH("username_submit", .1);
        this.formUtil.placeElementAt(71, 'username_submit', true);

        var button = document.getElementById('username_submit');
        
        button.addEventListener("click", function()
        {
            if (input.value == '')
            {
                error.innerHTML = 'Please enter a name.';
            }
            else 
            {
                error.innerHTML = '';
                socket.emit('join_game', input.value);
          
            }
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

        socket.on('success_joinedGame', function()
        {
            error.innerHTML = 'Joining game...';
            container.removeChild(label);
            container.removeChild(input);
            container.removeChild(button);
            container.removeChild(error);
            game.scene.start('GameScene');
        });
    }
}

export default TitleScene;

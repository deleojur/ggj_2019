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

        this.formUtil.scaleToGameW("username_label", 1);
        this.formUtil.scaleToGameH("username_label", .25);
        this.formUtil.placeElementAt(5, "username_label", true);

        this.formUtil.scaleToGameW("username_input", .5);
        this.formUtil.scaleToGameH("username_input", .1);
        this.formUtil.placeElementAt(38, 'username_input', true);

        this.formUtil.scaleToGameW("username_submit", .5);
        this.formUtil.scaleToGameH("username_submit", .1);
        this.formUtil.placeElementAt(71, 'username_submit', true);
    }
    update() {}
}

export default TitleScene;

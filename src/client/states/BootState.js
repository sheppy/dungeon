import Phaser from "phaser";


export default class BootState extends Phaser.State {
    preload() {
        this.load.image("preloadBar", "assets/preload-bar.png");
    }

    create() {
        // Max number of fingers to detect
        this.input.maxPointers = 1;

        if (this.game.device.desktop) {
            this.scale.pageAlignHorizontally = true;
            this.scale.pageAlignVertically = true;
        }

        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        // this.scale.setScreenSize(true); // Uncaught TypeError: this.game.scale.setScreenSize is not a function

        this.game.state.start("Preload", true, false);
    }
}

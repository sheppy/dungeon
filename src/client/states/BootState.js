import Phaser from "phaser";


export default class BootState extends Phaser.State {
    init() {
        // Max number of fingers to detect
        this.input.maxPointers = 1;

        if (this.game.device.desktop) {
            this.scale.pageAlignHorizontally = true;
            this.scale.pageAlignVertically = true;
        }

        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        // this.scale.setScreenSize(true); // Uncaught TypeError: this.game.scale.setScreenSize is not a function

        // Track when mouse leaves canvas
        this.input.mouse.mouseOutCallback = () => {
            this.input.mouse.isMouseOut = true;
        };
        this.input.mouse.mouseOverCallback = () => {
            this.input.mouse.isMouseOut = false;
        };
    }

    preload() {
        this.load.image("preloadBar", "assets/images/preload-bar.png");
    }

    create() {
        this.game.state.start("Preload", true, false);
    }
}

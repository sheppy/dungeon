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
        this.load.json("assets", "assets/assets.json");
    }

    create() {
        let assets = this.cache.getJSON("assets");
        this.game.state.start("Loading", true, false, {
            assets,
            nextState: "MainMenu"
        });
    }
}

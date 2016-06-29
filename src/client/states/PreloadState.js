import Phaser from "phaser";


export default class PreloadState extends Phaser.State {
    preloadAssets() {
        this.load.image("main-menu-bg", "assets/images/main-menu-bg.png");
        this.load.tilemap("map-test1", "assets/maps/test1.json", null, Phaser.Tilemap.TILED_JSON);
        this.load.image("cave2_bilevel", "assets/tiles/cave2_bilevel.png");
        this.load.image("collision", "assets/tiles/collision.png");
        // this.load.spritesheet("player", "assets/player.png", 24, 26);
    }

    preload() {
        this.load.crossOrigin = true;

        // Custom loading bar
        this.preloadBar = this.add.sprite(this.world.centerX, this.world.centerY, "preloadBar");
        this.preloadBar.anchor.setTo(0.5, 0.5);
        this.load.setPreloadSprite(this.preloadBar);

        this.time.advancedTiming = true;

        this.game.load.onFileComplete.add(this.fileComplete, this);
        this.preloadAssets();
    }

    fileComplete(progress, cacheKey, success, totalLoaded, totalFiles) {
        console.log("Preloaded", progress, cacheKey, success, totalLoaded, totalFiles);
    }

    create() {
        let tween = this.add.tween(this.preloadBar).to({ alpha: 0 }, 500, Phaser.Easing.Linear.None, true);
        tween.onComplete.add(this.startMainMenu, this);
    }

    startMainMenu() {
        this.game.state.start("MainMenu", true, false);
    }
}

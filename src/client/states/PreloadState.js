import Phaser from "phaser";


export default class PreloadState extends Phaser.State {
    preloadAssets() {
        // this.load.image("logo", "assets/logo.png");
        // this.load.image("menu-bg", "assets/menu-bg-2.png");
        // this.load.image("test", "assets/test.png");
        // this.load.tilemap("map-test1", "assets/tilemaps/test1.json", null, Phaser.Tilemap.TILED_JSON);
        // this.load.image("tiles-test1", "assets/tilemaps/test1.png");
    }

    preload() {
        this.load.crossOrigin = true;

        // Custom loading bar
        this.preloadBar = this.add.sprite(this.world.centerX, this.world.centerY, "preloadBar");
        this.preloadBar.anchor.setTo(0.5, 0.5);
        this.load.setPreloadSprite(this.preloadBar);

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

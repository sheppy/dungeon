import Phaser from "phaser";
import BootState from "./states/BootState";
import PreloadState from "./states/PreloadState";


export default class Game extends Phaser.Game {
    constructor() {
        super(640, 480, Phaser.AUTO, document.body, null, false, false);

        this.state.add("Boot", BootState, false);
        this.state.add("Preload", PreloadState, false);
        // this.state.add("Menu", MenuState, false);
        // this.state.add("Game", GameState, false);

        this.state.start("Boot");
    }
}

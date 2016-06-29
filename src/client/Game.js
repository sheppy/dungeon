import Phaser from "phaser";
import BootState from "./states/BootState";
import PreloadState from "./states/PreloadState";
import MainMenuState from "./states/MainMenuState";


export default class Game extends Phaser.Game {
    constructor() {
        super(640, 480, Phaser.AUTO, document.body, null, false, false);

        this.state.add("Boot", BootState, false);
        this.state.add("Preload", PreloadState, false);
        this.state.add("MainMenu", MainMenuState, false);

        this.state.start("Boot");
    }
}

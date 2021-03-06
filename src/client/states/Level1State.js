import Phaser from "phaser";
import dat from "exdat";
import PlayerPrefab from "../prefabs/PlayerPrefab";
import ViewportCameraPlugin from "../plugins/ViewportCameraPlugin";
import PathfindingPlugin from "../plugins/PathfindingPlugin";
import LineOfSightPlugin from "../plugins/LineOfSightPlugin";


export default class Level1State extends Phaser.State {
    create() {
        this.stage.backgroundColor = "#070707";

        this.createMap();

        // Scroll camera with keyboard & mouse
        this.game.plugins.add(ViewportCameraPlugin, {
            keyboardMove: true,
            keyboardMoveSpeed: 4,
            mouseEdgeMove: true,
            mouseEdgeMoveSpeed: 8,
            mouseEdgeRegion: 10,
            onCameraMove: this.updatePlayerLineOfSight.bind(this)
        });

        // this.setupGUI();

        // Render line of sight
        this.lineOfSight = this.game.plugins.add(LineOfSightPlugin, {
            tileMapLayer: this.layers.collision
        });

        this.createPlayer();
    }

    setupGUI() {
        this.gui = new dat.GUI();

        // var guiLevel = this.gui.addFolder('GameState');
        // guiLevel.add(this.player, 'x', 0, this.game.width).name('x').listen();
        // guiLevel.add(this.player, 'y', 0, this.game.height).name('y').listen();
        // guiLevel.open();
    }

    createMap() {
        // Create map and set tileset
        this.map = this.add.tilemap("map-test1");
        this.map.addTilesetImage(this.map.tilesets[0].name);
        this.map.addTilesetImage(this.map.tilesets[1].name);

        // Create map layers
        this.layers = {};
        this.map.layers.forEach(layer => {
            this.layers[layer.name] = this.map.createLayer(layer.name);

            // Collision layer
            if (layer.properties.collision) {
                let collisionTiles = [];
                this.layers[layer.name].alpha = 0;  // Hide this layer
                layer.data.forEach(dataRow => {
                    // Find tiles used in the layer
                    dataRow.forEach(tile => {
                        // Check if it's a valid tile index and isn't already in the list
                        if (tile.index > 0 && collisionTiles.indexOf(tile.index) === -1) {
                            collisionTiles.push(tile.index);
                        }
                    });
                });

                this.map.setCollision(collisionTiles, true, layer.name);
            }
        });

        // Resize the world to be the size of the current layer
        this.layers[this.map.layer.name].resizeWorld();
    }

    createPlayer() {
        let tileDimensions = new Phaser.Point(this.map.tileWidth, this.map.tileHeight);
        this.pathfinding = this.game.plugins.add(PathfindingPlugin, this.map.layers[1].data, [-1], tileDimensions);

        this.player = new PlayerPrefab(this, "player", { x: 176, y: 144 }, { texture: "male-sprite" });

        this.input.onDown.add(this.movePlayer, this);

        this.player.onMove.add(this.updatePlayerLineOfSight, this);
        this.updatePlayerLineOfSight()
    }

    updatePlayerLineOfSight() {
        this.lineOfSight.updateLineOfSite(this.player.x, this.player.y);
    }

    movePlayer() {
        this.player.moveTo(new Phaser.Point(this.game.input.activePointer.worldX, this.game.input.activePointer.worldY));
    }

    render() {
        this.game.debug.text(this.game.time.fps, 2, 14, "#00ff00");
    }
}

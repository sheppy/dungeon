import Phaser from "phaser";
import PlayerPrefab from "../prefabs/PlayerPrefab";
import ViewportCameraPlugin from "../plugins/ViewportCameraPlugin";
import PathfindingPlugin from "../plugins/PathfindingPlugin";


export default class Level1State extends Phaser.State {
    create() {
        this.stage.backgroundColor = "#070707";

        this.createMap();
        this.createPlayer();

        // Scroll camera with keyboard & mouse
        this.game.plugins.add(ViewportCameraPlugin, {
            keyboardMove: true,
            keyboardMoveSpeed: 4,
            mouseEdgeMove: true,
            mouseEdgeMoveSpeed: 8,
            mouseEdgeRegion: 10
        });
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
    }

    movePlayer() {
        this.player.moveTo(new Phaser.Point(this.game.input.activePointer.worldX, this.game.input.activePointer.worldY));
    }

}

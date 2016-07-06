import Phaser from "phaser";
import dat from "exdat";
import VisibilityPolygon from "visibility-polygon";
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

        // this.setupGUI();

        this.moveIndex = this.game.input.addMoveCallback(this.move, this);
        this.lightCanvas = this.game.add.graphics(0, 0);
        this.polygons = [];

        // TODO: Turn map in to polygons
        this.createOpaqueObjectsFromSolidTiles(this.layers.collision);
        this.polygons.push([[-1, -1], [this.world.width + 1, -1], [this.world.width + 1, this.world.height + 1], [-1, this.world.height + 1]]);
    }

    createOpaqueObjectsFromSolidTiles(tileMapLayer) {
        for (var r = 0; r < tileMapLayer.layer.data.length; r++) {
            var row = tileMapLayer.layer.data[r];

            for (var c = 0; c < row.length; c++) {
                var tile = row[c];

                if (tile.canCollide) {
                    let x = tile.x * tile.width;
                    let y = tile.y * tile.height;
                    this.polygons.push([
                        [x, y],
                        [x + tile.width, y],
                        [x + tile.width, y + tile.height],
                        [x, y + tile.height]
                    ]);
                }

            }
        }
    }

    move() {
        // when the mouse is moved, we determine the new visibility polygon
        var visibility = this.createLightPolygon(this.game.input.worldX, this.game.input.worldY);

        // then we draw it
        this.lightCanvas.clear();
        this.lightCanvas.lineStyle(2, 0xff8800, 1);
        this.lightCanvas.beginFill(0xffff00, 0.5);
        this.lightCanvas.moveTo(visibility[0][0], visibility[0][1]);
        for (var i = 1; i <= visibility.length; i++) {
            this.lightCanvas.lineTo(visibility[i % visibility.length][0], visibility[i % visibility.length][1]);
        }
        this.lightCanvas.endFill();
    }

    createLightPolygon(x, y) {
        var segments = VisibilityPolygon.convertToSegments(this.polygons);
        segments = VisibilityPolygon.breakIntersections(segments);
        var position = [x, y];
        if (VisibilityPolygon.inPolygon(position, this.polygons[this.polygons.length - 1])) {
            // return VisibilityPolygon.computeViewport(position, segments, [this.camera.x, this.camera.y], [this.camera.x + this.game.width, this.camera.y + this.game.height]);
            return VisibilityPolygon.compute(position, segments);
        }
        return null;
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
    }

    movePlayer() {
        this.player.moveTo(new Phaser.Point(this.game.input.activePointer.worldX, this.game.input.activePointer.worldY));
    }

    render() {
        this.game.debug.text(this.game.time.fps, 2, 14, "#00ff00");
    }

}

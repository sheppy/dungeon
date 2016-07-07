import Phaser from "phaser";
import dat from "exdat";
import VisibilityPolygon from "visibility-polygon";
import Shape from "clipper-js";
import PlayerPrefab from "../prefabs/PlayerPrefab";
import ViewportCameraPlugin from "../plugins/ViewportCameraPlugin";
import PathfindingPlugin from "../plugins/PathfindingPlugin";


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
            mouseEdgeRegion: 10
        });

        // this.setupGUI();

        this.lightBitmap = this.game.add.bitmapData(this.game.width, this.game.height);
        this.lightBitmap.context.fillStyle = "rgb(255, 255, 255)";
        this.lightBitmap.context.strokeStyle = "rgb(255, 255, 255)";

        // this.lightCanvas = this.game.add.graphics(0, 0);
        this.lightCanvas = this.game.add.image(0, 0, this.lightBitmap);
        this.lightCanvas.blendMode = Phaser.blendModes.MULTIPLY;
        this.lightCanvas.fixedToCamera = true;

        // Turn map in to polygons
        this.polygons = this.createVisibleTilemapPolygon(this.layers.collision);

        this.graphics = this.add.graphics(0, 0);

        this.createPlayer();
    }

    createVisibleTilemapPolygon(tileMapLayer) {
        let polygons = [];

        for (let r = 0, rm = tileMapLayer.layer.data.length; r < rm; r++) {
            let row = tileMapLayer.layer.data[r];

            for (let c = 0, cm = row.length; c < cm; c++) {
                let  tile = row[c];

                if (!tile.canCollide) {
                    let x = tile.x * tile.width;
                    let y = tile.y * tile.height;

                    polygons.push(new Phaser.Polygon(
                        x, y,
                        x + tile.width, y,
                        x + tile.width, y + tile.height,
                        x, y + tile.height
                    ));
                }
            }
        }

        // Join polygons
        let shape = new Shape(polygons.map(poly => poly.points), true, true);
        // polygons = shape.removeOverlap().mapToLower().map(points => new Phaser.Polygon(points));
        polygons = shape.removeOverlap().mapToLower().map(points => points.map(point => [point.x, point.y]));

        // Add world bounds?
        // polygons.push([[-1, -1], [this.world.width + 1, -1], [this.world.width + 1, this.world.height + 1], [-1, this.world.height + 1]]);

        // polygons.push(new Phaser.Polygon(
        //     -1, -1,
        //     this.world.width + 1, -1,
        //     this.world.width + 1, this.world.height + 1,
        //     -1, this.world.height + 1
        // ));


        return polygons;
    }

    updateLineOfSite(x, y) {
        // Determine the new visibility polygon
        var visibility = this.createLightPolygon(x, y);

        // Next, fill the entire light bitmap with a dark shadow color.
        this.lightBitmap.context.fillStyle = 'rgb(50, 50, 50)';
        this.lightBitmap.context.fillRect(0, 0, this.game.width, this.game.height);

        this.lightBitmap.context.beginPath();
        this.lightBitmap.context.fillStyle = 'rgb(255, 255, 255)';
        this.lightBitmap.context.moveTo(visibility[0][0] - this.camera.x, visibility[0][1] - this.camera.y);
        for (var i = 1; i <= visibility.length; i++) {
            this.lightBitmap.context.lineTo(visibility[i % visibility.length][0] - this.camera.x, visibility[i % visibility.length][1] - this.camera.y);
        }

        this.lightBitmap.context.closePath();
        this.lightBitmap.context.fill();

        this.lightBitmap.dirty = true;

        /*
        this.lightCanvas.clear();

        this.lightCanvas.beginFill(0x444444);
        this.lightCanvas.drawRect(0, 0, this.game.width, this.game.height);
        this.lightCanvas.endFill();

        this.lightCanvas.lineStyle(2, 0xff8800);
        this.lightCanvas.beginFill(0xffff00);
        this.lightCanvas.moveTo(visibility[0][0], visibility[0][1]);
        for (var i = 1; i <= visibility.length; i++) {
            this.lightCanvas.lineTo(visibility[i % visibility.length][0], visibility[i % visibility.length][1]);
        }
        this.lightCanvas.endFill();
        */
    }

    createLightPolygon(x, y) {
        var segments = VisibilityPolygon.convertToSegments(this.polygons);
        segments = VisibilityPolygon.breakIntersections(segments);
        var position = [x, y];
        if (VisibilityPolygon.inPolygon(position, this.polygons[this.polygons.length - 1])) {
            return VisibilityPolygon.computeViewport(position, segments, [this.camera.x, this.camera.y], [this.camera.x + this.game.width, this.camera.y + this.game.height]);
            // return VisibilityPolygon.compute(position, segments);
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

        this.player.onMove.add((x, y) => {
            this.updateLineOfSite(x, y);
        });
        this.updateLineOfSite(this.player.x, this.player.y);
    }

    movePlayer() {
        this.player.moveTo(new Phaser.Point(this.game.input.activePointer.worldX, this.game.input.activePointer.worldY));
    }

    render() {
        // this.graphics.clear();
        //
        // this.polygons.forEach(poly => {
        //     // let points = poly.points;
        //     let points = poly.map(point => ({ x: point[0], y: point[1] }));
        //     this.graphics.beginFill(0xFF33ff, 0.2);
        //     this.graphics.lineStyle(1, 0xFF33ff, 0.5);
        //     this.graphics.drawPolygon(points);
        //     this.graphics.endFill();
        // });

        this.game.debug.text(this.game.time.fps, 2, 14, "#00ff00");
    }

}

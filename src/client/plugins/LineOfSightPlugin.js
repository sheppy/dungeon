import Phaser from "phaser";
import VisibilityPolygon from "visibility-polygon";
import Shape from "clipper-js";


export default class LineOfSightPlugin extends Phaser.Plugin {
    constructor(game, parent) {
        super(game, parent);

        this.settings = {
            shadowColor: 'rgb(50, 50, 50)'
        };
    }

    init(settings = {}) {
        Object.assign(this.settings, settings);

        this.lightBitmap = this.game.add.bitmapData(this.game.width, this.game.height);
        this.lightBitmap.context.fillStyle = "rgb(255, 255, 255)";
        this.lightBitmap.context.strokeStyle = "rgb(255, 255, 255)";

        this.lightCanvas = this.game.add.image(0, 0, this.lightBitmap);
        this.lightCanvas.blendMode = Phaser.blendModes.MULTIPLY;
        this.lightCanvas.fixedToCamera = true;

        // Turn map in to polygons
        this.polygons = this.createVisiblePolygonFromTileMapLayer(this.settings.tileMapLayer);
    }

    createVisiblePolygonFromTileMapLayer(tileMapLayer) {
        let polygons = [];

        for (let r = 0, rm = tileMapLayer.layer.data.length; r < rm; r++) {
            let row = tileMapLayer.layer.data[r];

            for (let c = 0, cm = row.length; c < cm; c++) {
                let tile = row[c];

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
        this.lightBitmap.context.fillStyle = this.settings.shadowColor;
        this.lightBitmap.context.fillRect(0, 0, this.game.width, this.game.height);

        // Draw the visibility polygon
        this.lightBitmap.context.beginPath();
        this.lightBitmap.context.fillStyle = 'rgb(255, 255, 255)';
        this.lightBitmap.context.moveTo(visibility[0][0] - this.game.camera.x, visibility[0][1] - this.game.camera.y);

        for (var i = 1; i <= visibility.length; i++) {
            this.lightBitmap.context.lineTo(visibility[i % visibility.length][0] - this.game.camera.x, visibility[i % visibility.length][1] - this.game.camera.y);
        }

        this.lightBitmap.context.closePath();
        this.lightBitmap.context.fill();

        // Mark as changed for a redraw
        this.lightBitmap.dirty = true;
    }

    createLightPolygon(x, y) {
        var segments = VisibilityPolygon.convertToSegments(this.polygons);
        segments = VisibilityPolygon.breakIntersections(segments);
        var position = [x, y];
        if (VisibilityPolygon.inPolygon(position, this.polygons[this.polygons.length - 1])) {
            return VisibilityPolygon.computeViewport(position, segments, [this.game.camera.x, this.game.camera.y], [this.game.camera.x + this.game.width, this.game.camera.y + this.game.height]);
            // return VisibilityPolygon.compute(position, segments);
        }
        return null;
    }

}


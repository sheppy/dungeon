import Phaser from "phaser";


const CAMERA_MOVE_SPEED = 4;

export default class Level1State extends Phaser.State {
    create() {
        this.stage.backgroundColor = "#070707";

        this.cursors = this.input.keyboard.createCursorKeys();

        this.createMap();

        let player = this.add.sprite(0, 0, 'male-sprite');
        player.animations.add('walk-down', [0, 1, 2, 1], 10, true);
        player.animations.add('walk-left', [3, 4, 5, 4], 10, true);
        player.animations.add('walk-right', [6, 7, 8, 7], 10, true);
        player.animations.add('walk-up', [9, 10, 11, 10], 10, true);
        player.animations.play('walk-down');
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

    update() {
        // Keyboard camera movement
        if (this.cursors.up.isDown) {
            this.camera.y -= CAMERA_MOVE_SPEED;
        }
        else if (this.cursors.down.isDown) {
            this.camera.y += CAMERA_MOVE_SPEED;
        }

        if (this.cursors.left.isDown) {
            this.camera.x -= CAMERA_MOVE_SPEED;
        }
        else if (this.cursors.right.isDown) {
            this.camera.x += CAMERA_MOVE_SPEED;
        }

        // Mouse camera movement
        if (!this.input.mouse.isMouseOut) {
            if (this.input.mousePointer.x < 5) {
                this.camera.x -= CAMERA_MOVE_SPEED;
            } else if (this.input.mousePointer.x > this.game.width - 5) {
                this.camera.x += CAMERA_MOVE_SPEED;
            }

            if (this.input.mousePointer.y < 5) {
                this.camera.y -= CAMERA_MOVE_SPEED;
            } else if (this.input.mousePointer.y > this.game.height - 5) {
                this.camera.y += CAMERA_MOVE_SPEED;
            }
        }
    }

    render() {
        // this.game.debug.inputInfo(32, 32);
        // this.game.debug.cameraInfo(this.game.camera, 32, 32);
        // this.game.debug.pointer(this.game.input.activePointer);
    }

}

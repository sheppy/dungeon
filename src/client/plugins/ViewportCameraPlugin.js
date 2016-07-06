import Phaser from "phaser";


export default class ViewportCameraPlugin extends Phaser.Plugin {
    constructor(game, parent) {
        super(game, parent);

        this.settings = {
            keyboardMove: false,
            keyboardMoveSpeed: 4,
            keyboardKeys: {
                up: Phaser.KeyCode.UP,
                down: Phaser.KeyCode.DOWN,
                left: Phaser.KeyCode.LEFT,
                right: Phaser.KeyCode.RIGHT
            },

            mouseEdgeMove: false,
            mouseEdgeMoveSpeed: 8,
            mouseEdgeMoveRegion: 5
        };
    }

    init(settings = {}) {
        Object.assign(this.settings, settings);

        this.cursors = this.game.input.keyboard.addKeys({
            up: this.settings.keyboardKeys.up,
            down: this.settings.keyboardKeys.down,
            left: this.settings.keyboardKeys.left,
            right: this.settings.keyboardKeys.right
        });
    }

    update() {
        // Keyboard camera movement
        if (this.settings.keyboardMove) {
            if (this.cursors.up.isDown) {
                this.game.camera.y -= this.settings.keyboardMoveSpeed;
            }
            else if (this.cursors.down.isDown) {
                this.game.camera.y += this.settings.keyboardMoveSpeed;
            }

            if (this.cursors.left.isDown) {
                this.game.camera.x -= this.settings.keyboardMoveSpeed;
            }
            else if (this.cursors.right.isDown) {
                this.game.camera.x += this.settings.keyboardMoveSpeed;
            }
        }

        // Mouse edge camera movement
        if (this.settings.mouseEdgeMove) {
            if (!this.game.input.mouse.isMouseOut) {
                if (this.game.input.mousePointer.x < this.settings.mouseEdgeMoveRegion) {
                    this.game.camera.x -= this.settings.mouseEdgeMoveSpeed;
                } else if (this.game.input.mousePointer.x > this.game.width - this.settings.mouseEdgeMoveRegion) {
                    this.game.camera.x += this.settings.mouseEdgeMoveSpeed;
                }

                if (this.game.input.mousePointer.y < this.settings.mouseEdgeMoveRegion) {
                    this.game.camera.y -= this.settings.mouseEdgeMoveSpeed;
                } else if (this.game.input.mousePointer.y > this.game.height - this.settings.mouseEdgeMoveRegion) {
                    this.game.camera.y += this.settings.mouseEdgeMoveSpeed;
                }
            }
        }
    }
}



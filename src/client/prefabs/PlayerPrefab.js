import Phaser from "phaser";
import Prefab from "./Prefab";


export default class PlayerPrefab extends Prefab {
    constructor(state, name, position, properties) {
        super(state, name, position, properties);

        this.anchor.setTo(0.5, 0.5);
        this.state.game.add.existing(this);

        this.animations.add("walk-down", [1, 2, 1, 0], 10, true);
        this.animations.add("walk-left", [4, 5, 4, 3], 10, true);
        this.animations.add("walk-right", [7, 8, 7, 6], 10, true);
        this.animations.add("walk-up", [10, 11, 10, 9], 10, true);

        this.state.game.physics.arcade.enable(this);

        this.walkingSpeed = 100;
        this.path = [];
        this.pathStep = -1;

        this.onMove = new Phaser.Signal();
    }

    update() {
        // this.state.game.physics.arcade.collide(this, this.state.layers.collision);

        if (this.path.length > 0) {
            let nextPosition = this.path[this.pathStep];

            if (!this.hasReachedTargetPosition(nextPosition)) {
                let velocity = new Phaser.Point(nextPosition.x - this.position.x, nextPosition.y - this.position.y);
                velocity.normalize();
                this.body.velocity.x = velocity.x * this.walkingSpeed;
                this.body.velocity.y = velocity.y * this.walkingSpeed;
            } else {
                this.position.x = nextPosition.x;
                this.position.y = nextPosition.y;

                if (this.pathStep < this.path.length - 1) {
                    this.pathStep += 1;
                    nextPosition = this.path[this.pathStep];

                    // Update animation
                    if (nextPosition.x - this.position.x > 0) {
                        this.animations.play("walk-right");
                    } else if (nextPosition.x - this.position.x < 0) {
                        this.animations.play("walk-left");
                    } else if (nextPosition.y - this.position.y > 0) {
                        this.animations.play("walk-down");
                    } else if (nextPosition.y - this.position.y < 0) {
                        this.animations.play("walk-up");
                    }
                } else {
                    // Last position
                    this.path = [];
                    this.pathStep = -1;
                    this.body.velocity.x = 0;
                    this.body.velocity.y = 0;
                    this.animations.stop(true);
                }
            }
            this.onMove.dispatch(this.position.x, this.position.y);
        }
    }

    hasReachedTargetPosition(targetPosition) {
        return Phaser.Point.distance(this.position, targetPosition) < 1;
    }

    moveTo(targetPosition) {
        this.state.pathfinding.findPath(this.position, targetPosition, this.setPath, this);
    }

    setPath(path = []) {
        this.path = path;
        this.pathStep = 0;
    }
}

import Phaser from "phaser";
import EasyStar from "easystarjs";


export default class PathfindingPlugin extends Phaser.Plugin {
    constructor(game, parent) {
        super(game, parent);
        this.easyStar = new EasyStar.js();
    }

    init(worldGrid, acceptableTiles, tileDimensions) {
        this.gridDimensions = { row: worldGrid.length, column: worldGrid[0].length };

        let gridIndices = [];
        for (let gridRow = 0; gridRow < worldGrid.length; gridRow += 1) {
            gridIndices[gridRow] = [];
            for (let gridColumn = 0; gridColumn < worldGrid[gridRow].length; gridColumn += 1) {
                gridIndices[gridRow][gridColumn] = worldGrid[gridRow][gridColumn].index;
            }
        }

        this.easyStar.setGrid(gridIndices);
        this.easyStar.setAcceptableTiles(acceptableTiles);

        this.tileDimensions = tileDimensions;
    }

    findPath(origin, target, callback, context) {
        let originCoord = this.getCoordFromPoint(origin);
        let targetCoord = this.getCoordFromPoint(target);

        if (!this.isOutsideGrid(originCoord) && !this.isOutsideGrid(targetCoord)) {
            this.easyStar.findPath(originCoord.column, originCoord.row, targetCoord.column, targetCoord.row, this.pathFindingCallback.bind(this, callback, context));
            this.easyStar.calculate();
            return true;
        }

        return false;
    }

    pathFindingCallback(callback, context, path) {
        let pathPositions = [];
        if (path !== null) {
            path.forEach(function(pathCoord) {
                pathPositions.push(this.getPointFromCoord({ row: pathCoord.y, column: pathCoord.x }));
            }, this);
        }
        callback.call(context, pathPositions);
    }

    isOutsideGrid(coord) {
        return coord.row < 0 || coord.row > this.gridDimensions.row - 1 || coord.column < 0 || coord.column > this.gridDimensions.column - 1;
    }

    getCoordFromPoint(point) {
        return {
            row: Math.floor(point.y / this.tileDimensions.y),
            column: Math.floor(point.x / this.tileDimensions.x)
        };
    }

    getPointFromCoord(coord) {
        let x = (coord.column * this.tileDimensions.x) + (this.tileDimensions.x / 2);
        let y = (coord.row * this.tileDimensions.y) + (this.tileDimensions.y / 2);
        return new Phaser.Point(x, y);
    }
}



import { GameConfig } from "../../config/GameConfig.js";
import { MediaManager } from "../managers/MediaManager.js";
import { Asteroid } from "./Asteroid.js";

export class Rocko extends Asteroid {
    constructor(xLocation, yLocation, velocityX, velocityY) {
        /**
         * The width, height, angle (which doesn't really apply), sprite, collisionRadius, and mass are always the same for a Rocko.
         */
        super(xLocation, yLocation, 35, 36, 0, MediaManager.Sprites.Rocko, velocityX, velocityY, 18, 500, GameConfig.ROCKO_COLLISION_DAMAGE);
    }
}
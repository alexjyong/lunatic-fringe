import { GameConfig } from "../../config/GameConfig.js";
import { Layer } from "../managers/Layer.js";
import { MediaManager } from "../managers/MediaManager.js";
import { EnemyProjectile } from "./EnemyProjectile.js";

export class QuasBlasterProjectile extends EnemyProjectile {
    constructor(xLocation, yLocation, velocityX, velocityY) {
        super(xLocation, yLocation, Layer.QUAD_BLASTER_PROJECTILE, 13, 11, 0, MediaManager.Sprites.PhotonQuad, velocityX, velocityY, 3, 0, 50, GameConfig.QUADBLASTER_PROJECTILE_DAMAGE);
    }
}
import { Layer } from "../managers/Layer.js";
import { MediaManager } from "../managers/MediaManager.js";
import { ObjectManager } from "../managers/ObjectManager.js";
import { EnemyProjectile } from "./EnemyProjectile.js";
import { PhotonLarge } from "./PhotonLarge.js";

export class EnemyBasePhoton extends EnemyProjectile {
    constructor(xLocation, yLocation, velocityX, velocityY) {
        super(xLocation, yLocation, Layer.ENEMY_BASE_PHOTON, 17, 15, 0, MediaManager.Sprites.EnemyBasePhoton, velocityX, velocityY, 9, 2, 80, 150);
    }

    handleCollision(otherObject) {
        // We only want to play a sound when the player is hit, so don't handle playing sound here, have player handle it.
        // Enemy base projectiles "barrel through" Sludger Mines and player projectiles that are NOT the large photon, so don't die when those are hit
        this.log("Projectile " + this.getClassName() + " hit " + otherObject.getClassName());
        if (otherObject.layer !== Layer.SLUDGER_MINE && (otherObject.layer !== Layer.PLAYER_PROJECTILE || otherObject instanceof PhotonLarge)) {
            ObjectManager.removeObject(this);
        }
    }
}
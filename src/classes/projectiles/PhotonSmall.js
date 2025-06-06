import { GameConfig } from "../../config/GameConfig.js";
import { MediaManager } from "../managers/MediaManager.js";
import { PlayerProjectile } from "./PlayerProjectile.js";

export class PhotonSmall extends PlayerProjectile {
    constructor(xLocation, yLocation, velocityX, velocityY) {
        super(xLocation, yLocation, 7, 7, 0, MediaManager.Sprites.PhotonSmall, velocityX, velocityY, 4, 0, 50, GameConfig.PLAYER_BASIC_PROJECTILE_DAMAGE);
    }

    playCollisionSound() {
        MediaManager.Audio.CollisionDefaultWeapon.play();
    }
}
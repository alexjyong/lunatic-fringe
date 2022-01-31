import { Layer } from "../managers/Layer.js";
import { MediaManager } from "../managers/MediaManager.js";
import { PlayerProjectilePowerup } from "./PlayerProjectilePowerup.js";

export class SpreadShotPowerup extends PlayerProjectilePowerup {
    constructor(xLocation, yLocation) {
        super(xLocation, yLocation, Layer.BULLET_POWERUP, 19, 16, MediaManager.Sprites.SpreadShot, 9, 60 * 60, 'spreadShotActive', 39);
    }

    activate(playerShip) {
        playerShip.bulletState = playerShip.BULLETS.SPREADSHOT;
        playerShip.bulletShootingSpeed = this.shootingSpeed;
        document.getElementById(this.documentElementId).style.visibility = "visible";
    }

    deactivate(playerShip) {
        playerShip.bulletState = playerShip.BULLETS.SMALL;
        playerShip.bulletShootingSpeed = playerShip.DEFAULT_SHOOTING_SPEED;
        document.getElementById(this.documentElementId).style.visibility = "hidden";
    }
}
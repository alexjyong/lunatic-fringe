import { Layer } from "../managers/Layer.js";
import { MediaManager } from "../managers/MediaManager.js";
import { StoredDurationPowerup } from "./StoredDurationPowerup.js";

export class TurboThrustPowerup extends StoredDurationPowerup {
    constructor(xLocation, yLocation) {
        super(xLocation, yLocation, Layer.STORED_POWERUP, 15, 16, MediaManager.Sprites.TurboThrust, 8, 60 * 2, 'turboThrustAvailable', 'B');
    }

    activate(playerShip) {
        MediaManager.Audio.InvincibleOrBoost.play();
        playerShip.velocityX = -Math.cos(playerShip.angle) * playerShip.SPEED_OF_TURBO_THRUST;
        playerShip.velocityY = Math.sin(-playerShip.angle) * playerShip.SPEED_OF_TURBO_THRUST;
        playerShip.turboThrustActive = true;
    }

    deactivate(playerShip, playSoundsAndDisplayMessages) {
        if (playSoundsAndDisplayMessages) {
            MediaManager.Audio.SpawnAndUpgradeExpired.play();
        }
        
        document.getElementById(this.documentElementId).style.visibility = "hidden";
        playerShip.velocityX = playerShip.velocityX * playerShip.SPEED_AFTER_TURBO_THRUST / playerShip.SPEED_OF_TURBO_THRUST;
        playerShip.velocityY = playerShip.velocityY * playerShip.SPEED_AFTER_TURBO_THRUST / playerShip.SPEED_OF_TURBO_THRUST;
        playerShip.turboThrustActive = false;
    }
}
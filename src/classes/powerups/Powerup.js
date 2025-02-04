import { InteractableGameObject } from "../InteractableGameObject.js";
import { GameManager } from "../managers/GameManager.js";
import { MediaManager } from "../managers/MediaManager.js";
import { ObjectManager } from "../managers/ObjectManager.js";

export class Powerup extends InteractableGameObject {
    /**
     * Powerups do not move in the world, so their velocityX and velocityY should always be 0.
     * mass and angle also do not really apply, so set that to 0.
     */
    constructor(xLocation, yLocation, layer, width, height, sprite, collisionRadius) {
        super(xLocation, yLocation, layer, width, height, 0, sprite, 0, 0, collisionRadius, 0);

        this.log(this.getClassName() + " created at: (" + this.x + "," + this.y + ")");
    }

    playPowerupGainedSound() {
        MediaManager.Audio.PowerupWow.play();
    }

    handleCollision(otherObject) {
        this.log(this.getClassName() + " obtained by " + otherObject.getClassName());
        this.playPowerupGainedSound();
        ObjectManager.removeObject(this);
        // When a powerup is gained, a new powerup should spawn. See https://www.youtube.com/watch?v=zZglGbYGRtI at 29:50
        GameManager.spawnRandomPowerup();
    }

    updateState() {
        // Do nothing as powerups have no state to update
    }

    activate(playerShip) {
        this.error("The activate function should be overwritten by concrete subclasses!");
    }

    deactivate(playerShip, playSoundsAndDisplayMessages) {
        this.error("The deactivate function should be overwritten by concrete subclasses!");
    }
}
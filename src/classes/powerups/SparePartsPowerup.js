import { Layer } from "../managers/Layer.js";
import { MediaManager } from "../managers/MediaManager.js";
import { InstantPowerup } from "./InstantPowerup.js";

export class SparePartsPowerup extends InstantPowerup {
    constructor(xLocation, yLocation) {
        super(xLocation, yLocation, Layer.INSTANT_POWERUP, 13, 13, MediaManager.Sprites.SpareParts, 7);
    }

    activate(playerShip) {
        // Regain back 1/4th of the 
        playerShip.updateSpareParts(playerShip.MAXIMUM_SPARE_PARTS / 4);
    }
}
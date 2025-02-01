import { GameConfig } from "../../config/GameConfig.js";
import { KillableAiGameObject } from "../KillableAiGameObject.js";
import { Layer } from "../managers/Layer.js";
import { MediaManager } from "../managers/MediaManager.js";
import { ObjectManager } from "../managers/ObjectManager.js";
import { SludgerMine } from "./SludgerMine.js";

export class Sludger extends KillableAiGameObject {
    static MAX_SPEED = 3;

    constructor(xLocation, yLocation, velocityX, velocityY, playerShip) {
        // According to gameplay footage killing a Sludger was worth 50 points
        // Sludger does not change directions, so starting angle can just be zero since it always starts in the same state
        super(xLocation, yLocation, Layer.SLUDGER, 34, 31, 0, MediaManager.Sprites.Sludger, velocityX, velocityY, 16, 8, playerShip, 40, 40, GameConfig.SLUDGER_POINT_VALUE);

        this.currentTicksInAnimationFrame = 0;
        this.NUMBER_OF_TICKS_BETWEEN_ANIMATION_FRAMES = 7;
        this.NUMBER_OF_ANIMATION_FRAMES = 15;

        this.numberOfTicksSinceSpawnedMine = 0;
        // A new mine should be spawned in every 5 seconds
        this.MINE_SPAWN_TIME = 5 * 60;
    }

    updateState() {
        // Handle animation
        this.currentTicksInAnimationFrame += 1;
        if (this.currentTicksInAnimationFrame >= this.NUMBER_OF_TICKS_BETWEEN_ANIMATION_FRAMES) {
            this.currentTicksInAnimationFrame = 0;
            this.spriteXOffset += this.width;
            if (this.spriteXOffset >= (this.width * this.NUMBER_OF_ANIMATION_FRAMES)) {
                this.spriteXOffset = 0;
            }
        }

        // Update position
        this.x += this.velocityX;
        this.y+= this.velocityY;

        // Spawn new sludger mines
        this.numberOfTicksSinceSpawnedMine++;
        if (this.numberOfTicksSinceSpawnedMine > this.MINE_SPAWN_TIME) {
            this.numberOfTicksSinceSpawnedMine = 0;
            let newSludgerMine = new SludgerMine(this.x, this.y, 0, 0, this.playerShipReference);
            ObjectManager.addObject(newSludgerMine, true);
        }
    }
}
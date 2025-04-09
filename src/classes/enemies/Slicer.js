import { GameConfig } from "../../config/GameConfig.js";
import { Vector } from "../../utility/Vector.js";
import { KillableAiGameObject } from "../KillableAiGameObject.js";
import { Layer } from "../managers/Layer.js";
import { MediaManager } from "../managers/MediaManager.js";

export class Slicer extends KillableAiGameObject {
    static MAX_SPEED = 10;

    constructor(xLocation, yLocation, velocityX, velocityY, angle, playerShip) {
        super(xLocation, yLocation, Layer.SLICER, 50, 50, angle, MediaManager.Sprites.Slicer, velocityX, velocityY, 14, 50, playerShip, GameConfig.SLICER_COLLISION_DAMAGE, GameConfig.SLICER_HEALTH, GameConfig.SLICER_POINT_VALUE);

        this.TURN_ABILITY = 0.3;
        this.ACCELERATION = 0.175;

        this.NUMBER_OF_ANIMATION_FRAMES = 26;
        this.ROTATION_AMOUNT = (2 * Math.PI) / this.NUMBER_OF_ANIMATION_FRAMES;

        // set the initial sprite x offset based on the angle given
        this.setSpriteXOffsetForAngle();
    }

    setSpriteXOffsetForAngle() {
        // Calculate which frame of the sprite. Note the following reasons for each part of the calculation:
        // +(Math.PI / 2): The sprite for the Puffer starts straight up, so an angle offset of Math.PI/2 (a quarter rotation of a circle) is needed for this calculation so that the correct frame is chosen since an angle of 0 is pointing to the right not straight up.
        // +(this.ROTATION_AMOUNT / 2): Adding half of the rotation amount here so that each frame is centered around the angles that it applies to.
        // +this.angle: The angle the ship is currently pointing.
        // % (2 * Math.PI): Takes whatever the result of the calculation with the above values is and makes it between 0 (inclusive) and 2 * Math.PI (exclusive).
        // FUTURE TODO: Due to the isometric sprite view there are some instances where the angles don't line up great with the sprite (barely). So in the future might want to look into how to make the angles match up with the sprite a little better.
        let frameAngle = ((Math.PI / 2) + this.ROTATION_AMOUNT / 2 + this.angle) % (2 * Math.PI);
        let frame = Math.floor(frameAngle/this.ROTATION_AMOUNT);

        this.spriteXOffset = this.width * frame;
    }

    updateState() {
        let angleDiff = this.angleDiffTo(this.playerShipReference);

        // only move the ship angle toward player as fast as the turn ability will allow.
        if (angleDiff > 0) {
            if (this.TURN_ABILITY > angleDiff) {
                // only turn angle difference
                this.angle += angleDiff;
            } else { 
                // turn maximum amount possible
                this.angle += this.TURN_ABILITY;
            }
        } else {
            // Will handle if angleDiff = 0 since this next statement will be guaranteed to be true so we will add angleDiff to the angle, which would be 0 (meaning the angle would not change)
            if (-1 * this.TURN_ABILITY < angleDiff) {
                // only turn angle difference
                // Note that the angle different here is already negative
                this.angle += angleDiff;
            } else { 
                // turn maximum amount possible
                this.angle += -1 * this.TURN_ABILITY;
            }
        }

        // Keep angle between 0 and 2 * Math.PI
        if (this.angle > 2 * Math.PI) {
            this.angle -= 2 * Math.PI;
        } else if (this.angle < 0) {
            this.angle += 2 * Math.PI;
        }
        if (this.angle > 2 * Math.PI || this.angle < 0) {
            this.error(`Slicer angle ${this.angle} was outside of the expected range`);
        }

        this.setSpriteXOffsetForAngle();

        // Only accellerate if we close enough to pointing at what we are targeting
        if (angleDiff > -0.1 && angleDiff < 0.1) {
            this.calculateAcceleration();
        }

        // slow down object in perpendicular direction to help prevent "orbiting"
        let vectorToPlayer = new Vector(this.playerShipReference.x - this.x, this.playerShipReference.y - this.y);
        let velocity = new Vector(this.velocityX, this.velocityY);
        let perpendicularVelocity = velocity.subtract(vectorToPlayer.normalize().scale(velocity.dotProduct(vectorToPlayer.normalize())));
        // reduce perpendicular speed by 10%
        let dampeningAmount = perpendicularVelocity.scale(-.01);

        this.velocityX += dampeningAmount.x;
        this.velocityY += dampeningAmount.y;

        //Update position of Slicer
        this.x += this.velocityX;
        this.y += this.velocityY;
    }
}
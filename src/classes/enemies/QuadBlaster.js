import { GameConfig } from "../../config/GameConfig.js";
import { KillableAiGameObject } from "../KillableAiGameObject.js";
import { Layer } from "../managers/Layer.js";
import { MediaManager } from "../managers/MediaManager.js";
import { ObjectManager } from "../managers/ObjectManager.js";
import { QuasBlasterProjectile } from "../projectiles/QuadBlasterProjectile.js";

export class QuadBlaster extends KillableAiGameObject {
    static MAX_SPEED = 1;

    constructor(xLocation, yLocation, velocityX, velocityY, playerShip) {
        // According to gameplay footage killing a QuadBlaster was worth 50 points
        // QuadBlaster does not change directions, so starting angle can just be zero since it always starts in the same state
        super(xLocation, yLocation, Layer.QUAD_BLASTER, 40, 50, 0, MediaManager.Sprites.QuadBlaster, velocityX, velocityY, 16, 8, playerShip, GameConfig.QUADBLASTER_COLLISION_DAMAGE, GameConfig.QUADBLASTER_HEALTH, GameConfig.QUADBLASTER_POINT_VALUE);

        // For some reason the QuadBlaster sprite has an offset of 10 pixels on the spritesheet, so account for that with a constant here
        this.BASE_SPRITE_X_OFFEST = 10;
        this.spriteXOffset = this.BASE_SPRITE_X_OFFEST;

        this.currentTicksInAnimationFrame = 0;
        this.NUMBER_OF_TICKS_BETWEEN_ANIMATION_FRAMES = 10;
        this.NUMBER_OF_ANIMATION_FRAMES = 8;
        // A full animation of the sprite is actually 1/4th of a turn for this enemy, so multiply number of frames times 4 here
        // NOTE: The third and fourth sprite images in the sprite sheet are the same (which is how the quadblaster gets its pause in the animation). This means the rotation
        // amount is actually one LESS than the number of animation frames, and between frames 3 and 4 the angle should not change since the quadblaster didn't "rotate"
        this.ROTATION_AMOUNT = (2 * Math.PI) / ((this.NUMBER_OF_ANIMATION_FRAMES - 1) * 4);
        this.MAX_FIRE_RATE = 3 * 60;
        this.MIN_FIRE_RATE = 0.3 * 60;
        this.PROJECTILE_SPEED = 10;

        this.numberOfTicksSinceShooting = 0;
        this.shootingRechargeTime = this.getRechargeTimeForShooting();
        this.QUADRANTS = [
            0,
            Math.PI/2,
            -Math.PI/2,
            Math.PI
        ];

        // FUTURE TODO: Might as well leave this in as it prevents unnecessary checks when enemy is not on the screen (although would be issue if screen is super small...). Will be worth looking into to see if we want to change this or if we also want to do this for other enemies that have projectiles aka the Puffer.
        this.inScene = false;
    }

    getRechargeTimeForShooting() {
        return (Math.random() * this.MAX_FIRE_RATE) + this.MIN_FIRE_RATE;
    }

    getAngleOfBarrelTowardPlayer() {
        let angleToPlayer = this.angleTo(this.playerShipReference);
        

        let closest = null;
        let quadrantAdjusted = [];
        for (let i = 0; i < 4; i++) {
            quadrantAdjusted[i] = this.QUADRANTS[i] + this.angle;
            // Keep the angle between -Math.PI and Math.PI
            if (quadrantAdjusted[i] > Math.PI) {
                quadrantAdjusted[i] -= 2 * Math.PI;
            } else if (quadrantAdjusted[i] < -Math.PI) {
                quadrantAdjusted[i] += 2 * Math.PI;
            }
            // Set closest if it is not defined or if the new value is smaller than the existing closest value
            // NOTE: Can't use !closest check here instead of closest == null because when angles are exactly multiples of 90 degrees one of them will be 0, and !0 is equal to true in javascript
            if (closest == null || Math.abs(quadrantAdjusted[i] - angleToPlayer) < Math.abs(closest - angleToPlayer)) {
                closest = quadrantAdjusted[i];
            }
        }

        return closest;
    }

    draw(canvasContext, effectCanvasContext, percentageVisible) {
        super.draw(canvasContext, effectCanvasContext, percentageVisible);
        // Drawing means we are in the scene
        this.inScene = true;

        // Draw additional debug arc for which barrel is closest to the player
        if (GameConfig.debug) {
            let barrelAngle = this.getAngleOfBarrelTowardPlayer();
            canvasContext.beginPath();
            canvasContext.strokeStyle = "green";
            canvasContext.moveTo(this.x, this.y);
            canvasContext.lineTo(this.x + Math.cos(barrelAngle) * this.collisionRadius * 2, this.y + Math.sin(barrelAngle) * this.collisionRadius * 2);
            canvasContext.stroke();

            canvasContext.beginPath();
            canvasContext.strokeStyle = "red";
            canvasContext.arc(this.x, this.y, this.collisionRadius + 2, barrelAngle-0.775, barrelAngle+0.775);
            canvasContext.lineWidth = 2;
            canvasContext.stroke();
        }
    }

    updateState() {
        this.x += this.velocityX;
        this.y += this.velocityY;

        if (!this.inScene) {
            // Don't perform the rest of the updates if not in scene
            return;
        }
        this.inScene = false;

        // Handle animation
        this.currentTicksInAnimationFrame += 1;
        if (this.currentTicksInAnimationFrame >= this.NUMBER_OF_TICKS_BETWEEN_ANIMATION_FRAMES) {
            this.currentTicksInAnimationFrame = 0;
            this.spriteXOffset += this.width;
            // Only update the angle if this is not the transition to the 4th frame (which is the same as the 3rd frame, meaning the sprite doesn't actually "turn")
            // Note that the x offset of the 4th frame is width*3, since the first frame has offset 0
            if (this.spriteXOffset != this.width * 3 + this.BASE_SPRITE_X_OFFEST) {
                this.angle += this.ROTATION_AMOUNT;
                if (this.angle > Math.PI) {
                    this.angle -= 2 * Math.PI;
                }
            }
            if (this.spriteXOffset >= (this.width * this.NUMBER_OF_ANIMATION_FRAMES)) {
                this.spriteXOffset = this.BASE_SPRITE_X_OFFEST;
            }
        }

        this.numberOfTicksSinceShooting++;

        if (this.numberOfTicksSinceShooting > this.shootingRechargeTime) {
            let barrelToPlayer = this.getAngleOfBarrelTowardPlayer();
            let angleToPlayer = this.angleTo(this.playerShipReference);
            let angleRatio = angleToPlayer/barrelToPlayer;
            if (angleRatio < 1.15 && angleRatio > 0.85) {
                let angleOffset = barrelToPlayer - this.angle;
                let newProjectilePosition = this.getNewProjectilePosition(angleOffset);
                let newProjectileVelocity = this.getNewProjectileVelocity(this.PROJECTILE_SPEED, angleOffset);
                let newQuadBlasterProjectile = new QuasBlasterProjectile(newProjectilePosition.x, newProjectilePosition.y, newProjectileVelocity.x, newProjectileVelocity.y);
                ObjectManager.addObject(newQuadBlasterProjectile, true);
                this.numberOfTicksSinceShooting = 0;
                this.shootingRechargeTime = this.getRechargeTimeForShooting();
            }
        }
    }
}
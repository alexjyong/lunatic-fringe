import { GameConfig } from "../../config/GameConfig.js";
import { EnemyBase } from "../EnemyBase.js";
import { PlayerBase } from "../PlayerBase.js";
import { PlayerShip } from "../player/PlayerShip.js";
import { Star } from "../Star.js";
import { CollisionManager } from "./CollisionManager.js";
import { GameServiceManager } from "./GameServiceManager.js";
import { Layer } from "./Layer.js";
import { MediaManager } from "./MediaManager.js";
import { ObjectManager } from "./ObjectManager.js";
import { GameBound, GameBoundSize } from "./GameBound.js";
import { Vector } from "../../utility/Vector.js";
import { RandomUtil } from "../../utility/RandomUtil.js";
import { Pebbles } from "../asteroids/Pebbles.js";
import { Rocko } from "../asteroids/Rocko.js";
import { PhotonLargePowerup } from "../powerups/PhotonLargePowerup.js";
import { SpreadShotPowerup } from "../powerups/SpreadShotPowerup.js";
import { DoublePointsPowerup } from "../powerups/DoublePointsPowerup.js";
import { ExtraFuelPowerup } from "../powerups/ExtraFuelPowerup.js";
import { ShipRepairsPowerup } from "../powerups/ShipRepairsPowerup.js";
import { SparePartsPowerup } from "../powerups/SparePartsPowerup.js";
import { PowerShieldPowerup } from "../powerups/PowerShieldPowerup.js";
import { TurboThrustPowerup } from "../powerups/TurboThrustPowerup.js";
import { DocumentManager } from "./DocumentManager.js";
import { LevelManager } from "./LevelManager.js";
import { LocalStorageHighscoreService } from "../../scoring/LocalStorageHighscoreService.js";
import { Screen, ScreenManager } from "./ScreenManager.js";
import { Score } from "../../scoring/Score.js";

export class GameManager {
    static scannerContext;
    static scannerProjectileContext;
    static scannerEffectContext;

    static radarContext;

    static numMessageTicks;
    static message;
    static playerShip;
    static isPaused;
    static wasPausedByPlayerPressingPauseKey;
    static isRunning = false;
    static {
        // Need to bind animationLoop function to `this` or else we lose the `this` context when requestAnimationFrame calls the function
        this.animationLoop = this.animationLoop.bind(this);
    }

    // Variables used to run the game loop
    static SKIP_TICKS = 1000 / 60
    static MAX_FRAME_SKIP = 10
    static nextGameTick //NOTE: Should be set right before game starts so that it is as recent as possible

    static highScoreService;
    static NUMBER_OF_HIGH_SCORES_TO_TRACK = 10;

    static isGameRunning() {
        return this.isRunning;
    }

    static setupGame() {
        console.log('Starting new game of Lunatic Fringe');

        this.highScoreService = new LocalStorageHighscoreService(this.NUMBER_OF_HIGH_SCORES_TO_TRACK);
        // Updates high scores in the document. Also removes any highlighting due to missing optional parameter
        this.highScoreService.getHighscores().then((highScores) => {
            DocumentManager.updateHighScoresElements(highScores);
        })

        DocumentManager.setScannerAndRadarCanvasSizes();

        const scannerCanvas = document.getElementById('scannerCanvas');
        const scannerProjectileCanvas = document.getElementById('projectilesScannerCanvas');
        const effectScannerCanvas = document.getElementById('effectScannerCanvas');
        const radarCanvas = document.getElementById('radarCanvas');

        this.scannerContext = scannerCanvas.getContext("2d", { willReadFrequently: true });
        this.scannerProjectileContext = scannerProjectileCanvas.getContext("2d", { willReadFrequently: true });
        this.scannerEffectContext = effectScannerCanvas.getContext("2d", { willReadFrequently: true });

        this.radarContext = radarCanvas.getContext("2d", { willReadFrequently: true });

        this.isPaused = false;
        this.wasPausedByPlayerPressingPauseKey = false;
        this.isRunning = true;

        // Reset the object manager for a new game. Initialize this before the game and level managers.
        ObjectManager.resetForNewGame();

        // Initialize the game service manager
        GameServiceManager.initialize(this);

        // Initialize the level manager
        LevelManager.initializeGame();

        // Initalize all of the game objects
        // Create the player
        this.playerShip = new PlayerShip(this.scannerContext.canvas.width / 2, this.scannerContext.canvas.height / 2, 0, 0);
        // Player starts with turbo thrust and power shield powerups
        this.playerShip.powerupStateManager.obtainPowerup(new PowerShieldPowerup(0, 0));
        this.playerShip.powerupStateManager.obtainPowerup(new TurboThrustPowerup(0, 0));

        // Add the background stars
        for (let i = 0; i < 1000; i++) {
            let x = RandomUtil.randomNumber(GameBound.LEFT, GameBound.RIGHT);
            let y = RandomUtil.randomNumber(GameBound.TOP, GameBound.BOTTOM);
            ObjectManager.addObject(new Star(x, y), false)
        }

        // Add the player base. Offset the y location by the constant from the player ship here so that it matches the offset the ship uses when docking at the base. This is so that the ship is correctly centered on the base when the game is started.
        let playerBaseLocation = new Vector(this.scannerContext.canvas.width / 2, this.scannerContext.canvas.height / 2 + this.playerShip.BASE_DOCKING_OFFSET);
        ObjectManager.addObject(new PlayerBase(playerBaseLocation.x, playerBaseLocation.y));

        // Add the enemy base
        // Slightly randomize the location of the Enemy base compared to the player base so that it is not always in the same place but also cannot be right next to the player base (looks like the original game might have done something like this)
        const enemyBaseOffsetFromPlayerBase = new Vector(
            GameBoundSize + GameConfig.ENEMY_BASE_SPAWN_VARIATION_PERCENTAGE * RandomUtil.randomNumber(-GameBoundSize, GameBoundSize),
            GameBoundSize + GameConfig.ENEMY_BASE_SPAWN_VARIATION_PERCENTAGE * RandomUtil.randomNumber(-GameBoundSize, GameBoundSize)
        );
        const enemyBaseLocation = playerBaseLocation.add(enemyBaseOffsetFromPlayerBase)
        this.checkBounds(enemyBaseLocation);
        ObjectManager.addObject(new EnemyBase(enemyBaseLocation.x, enemyBaseLocation.y, this.playerShip));
        console.log(`Enemy Base created at (${enemyBaseLocation.x}, ${enemyBaseLocation.y})`);

        // Add asteroids to the game
        for (let i = 0; i < 14; i++) {
            let randomPosition = this.getRandomStartingPosition();
            let randomVelocity = this.getRandomStartingVelocity(2);
            ObjectManager.addObject(new Pebbles(randomPosition.x, randomPosition.y, randomVelocity.x, randomVelocity.y));
        }

        for (let i = 0; i < 8; i += 1) {
            let randomPosition = this.getRandomStartingPosition();
            let randomVelocity = this.getRandomStartingVelocity(3);
            ObjectManager.addObject(new Rocko(randomPosition.x, randomPosition.y, randomVelocity.x, randomVelocity.y));
        }

        // Add the player ship to the object array so it draws on top of most objects
        ObjectManager.addObject(this.playerShip);

        // Play startup sound
        MediaManager.Audio.SpawnAndUpgradeExpired.play();

        // Set the current time to be the next game tick right before the animation loop starts to make it as recent as possible
        this.nextGameTick = (new Date()).getTime();

        // Start the game by kicking off an animation loop
        this.animationLoop();
    }

    static getRandomStartingPosition() {
        return new Vector(RandomUtil.randomNumber(GameBound.LEFT, GameBound.RIGHT), RandomUtil.randomNumber(GameBound.TOP, GameBound.BOTTOM));
    }

    static getRandomStartingVelocity(maxStartingSpeed) {
        return new Vector(RandomUtil.randomNumber(-maxStartingSpeed, maxStartingSpeed), RandomUtil.randomNumber(-maxStartingSpeed, maxStartingSpeed));
    }

    static spawnRandomPowerup() {
        let randomPowerupNumber = RandomUtil.randomInteger(0, 8);
        let randomPosition = this.getRandomStartingPosition();

        switch (randomPowerupNumber) {
            case 0:
                ObjectManager.addObject(new PhotonLargePowerup(randomPosition.x, randomPosition.y));
                break;
            case 1:
                ObjectManager.addObject(new SpreadShotPowerup(randomPosition.x, randomPosition.y));
                break;
            case 2:
                ObjectManager.addObject(new DoublePointsPowerup(randomPosition.x, randomPosition.y));
                break;
            case 3:
                ObjectManager.addObject(new ExtraFuelPowerup(randomPosition.x, randomPosition.y));
                break;
            case 4:
                ObjectManager.addObject(new ShipRepairsPowerup(randomPosition.x, randomPosition.y));
                break;
            case 5:
                ObjectManager.addObject(new PowerShieldPowerup(randomPosition.x, randomPosition.y));
                break;
            case 6:
                ObjectManager.addObject(new TurboThrustPowerup(randomPosition.x, randomPosition.y));
                break;
            case 7:
                ObjectManager.addObject(new SparePartsPowerup(randomPosition.x, randomPosition.y));
                break;
            default:
                this.error(`random powerup number ${randomPowerupNumber} was unexpected`);
        }
    }

    static checkBounds(object) {
        if (object.x > GameBound.RIGHT) {
            object.x = GameBound.LEFT + (object.x - GameBound.RIGHT);
        }
        else if (object.x < GameBound.LEFT) {
            object.x = GameBound.RIGHT - (GameBound.LEFT - object.x);
        }
        if (object.y > GameBound.BOTTOM) {
            object.y = GameBound.TOP + (object.y - GameBound.BOTTOM);
        }
        else if (object.y < GameBound.TOP) {
            object.y = GameBound.BOTTOM - (GameBound.TOP - object.y);
        }
    }

    static displayMessage(text, ticksToShow) {
        this.numMessageTicks = ticksToShow;
        this.message = text;
        console.log("DisplayMessage called with " + text + " - " + ticksToShow);
    }

    static handleResize() {
        // Only need to handle a resize if the game is actually currently running
        if (this.isGameRunning()) {
            let oldCenterX = this.scannerContext.canvas.width / 2;
            let oldCenterY = this.scannerContext.canvas.height / 2;

            let scannerDimensions = DocumentManager.getElementDimensions('scanner');
            // Scanner dimenions being zero means they are currently hidden from the screen, do not handle resize as current size is 0
            if (scannerDimensions.x !== 0 && scannerDimensions.y !== 0) {
                this.scannerContext.canvas.width = scannerDimensions.x;
                this.scannerContext.canvas.height = scannerDimensions.y;
    
                this.scannerProjectileContext.canvas.width = scannerDimensions.x;
                this.scannerProjectileContext.canvas.height = scannerDimensions.y;
    
                this.scannerEffectContext.canvas.width = scannerDimensions.x;
                this.scannerEffectContext.canvas.height = scannerDimensions.y;
    
                let diffX = this.scannerContext.canvas.width / 2 - oldCenterX;
                let diffY = this.scannerContext.canvas.height / 2 - oldCenterY;
    
                for (let i = 0; i < ObjectManager.objects.length; i++) {
                    ObjectManager.objects[i].x += diffX;
                    ObjectManager.objects[i].y += diffY;
                    this.checkBounds(ObjectManager.objects[i]);
                }

                // Redraw the scene
                GameManager.drawScene();
            }
        }
    }

    static moveObject(object) {
        // PlayerShip doesn't move like other objects do
        if (object instanceof PlayerShip) {
            return;
        }

        object.x -= this.playerShip.velocityX;
        object.y -= this.playerShip.velocityY;
        this.checkBounds(object);
    }

    static updateObjects(objects) {
        // create copy of array here since some objects can be deleted or removed during these steps
        let objectsSnapshot = objects.slice(0);

        for (let i = 0; i < objectsSnapshot.length; i++) {
            // So this is here because we want to process player input before moving objects or updating states since input can affect the movement of the ship and creation of bullets
            // This probably could be handled better but will be staying this way for now.
            if (objectsSnapshot[i] instanceof PlayerShip) {
                objectsSnapshot[i].processInput();
            }
            this.moveObject(objectsSnapshot[i]);
            objectsSnapshot[i].updateState();
        }
    };

    static detectCollisions(collidables) {
        let collidablesSnapshot = collidables.slice(0);

        for (let i = 0; i < collidablesSnapshot.length; i++) {
            for (let j = i + 1; j < collidablesSnapshot.length; j++) {
                // first check to see if the layers the objects are on are allowed to collide, if not no point in doing all of the math along with it and calling handle collision on everything
                if (CollisionManager.doObjectLayersCollide(collidablesSnapshot[i], collidablesSnapshot[j]) && (Math.pow((collidablesSnapshot[j].getCollisionCenterX() - collidablesSnapshot[i].getCollisionCenterX()), 2) + Math.pow((collidablesSnapshot[j].getCollisionCenterY() - collidablesSnapshot[i].getCollisionCenterY()), 2)
                    <=
                    Math.pow((collidablesSnapshot[i].collisionRadius + collidablesSnapshot[j].collisionRadius), 2))) {

                    if ((collidablesSnapshot[i] instanceof PlayerShip && collidablesSnapshot[i].isDead) || (collidablesSnapshot[j] instanceof PlayerShip && collidablesSnapshot[j].isDead)) {
                        // Ignore collisions with the player if the player is dead
                        // Necessary because we do not want to remove the player from the game, enemies still act like player is in the space where they died
                        continue;
                    }

                    // This stores the velocity of the first object before handling the collision of the first object with the second object (which changes the velocity of the first object).
                    // It then stores the new velocity of the first object, sets the first object back to the old velocity and then handles collision of the second object with the first object
                    // (that way the second object reacts based on the first objects original velocity). After that it sets the velocity of the first object back to the new velocity.
                    let oldVelX = collidablesSnapshot[i].velocityX;
                    let oldVelY = collidablesSnapshot[i].velocityY;
                    collidablesSnapshot[i].handleCollision(collidablesSnapshot[j]);
                    let newVelX = collidablesSnapshot[i].velocityX;
                    let newVelY = collidablesSnapshot[i].velocityY;
                    collidablesSnapshot[i].velocityX = oldVelX;
                    collidablesSnapshot[i].velocityY = oldVelY;
                    collidablesSnapshot[j].handleCollision(collidablesSnapshot[i]);
                    collidablesSnapshot[i].velocityX = newVelX;
                    collidablesSnapshot[i].velocityY = newVelY;
                }
            }
        }
    };

    // FUTURE TODO: In the future when levels are implemented this should be changed so that when enemies are spawned in a counter is set
    // to keep track of current number of enemies, that way it doesn't have to iterate through all objects every time.
    static enemiesRemaining() {
        let numEnemies = 0;

        let object;
        // Only check collidables here since enemies we care about are all collidable. Don't need to be searching through array with all of the stars.
        for (let i = 0; i < ObjectManager.collidables.length; i++) {
            object = ObjectManager.collidables[i]
            if (CollisionManager.isEnemyLayer(object.layer) && object.layer !== Layer.ENEMY_BASE) {
                numEnemies++;
            }
        }

        return numEnemies;
    }

    /**
     * Applies a "static-y" effect to a section of a canvas by changing the alpha component of a certain number of pixels in the area
     * based on the passed in percentage.
     * 
     * @param {*} context The canvas context to apply the effect to
     * @param {*} percentWorking number 0 to 100, used to determine how many of the pixels in the area should have the effect applied, on average
     * @param {*} x The leftmost x value of the section to apply the effect to
     * @param {*} y The topmost y value of the section to apply the effect to
     * @param {*} width The width of the section to apply the effect to 
     * @param {*} height The height of the section to apply the effect to
     */
    static applyStaticEffectToCanvas(context, percentWorking, x, y, width, height) {
        const floorX = Math.floor(x);
        const floorY = Math.floor(y);
        // Note: Since pixels do not use float values, getImageData appears to floor the x and y numbers before getting the image data from the canvas which is why we do so above
        let pixels = context.getImageData(x, y, width, height);
        let pixelData = pixels.data;
        for (let i = 0, n = pixelData.length; i < n; i += 4) {
            const canvasXCoordinate = floorX + ((i / 4) % width);
            const canvasYCoordinate = floorY + Math.floor((i / 4) / width); // Y offset is still based on width, not height!

            // If the pixel is off of the canvas we do not need to bother with drawing the effect
            if (canvasXCoordinate < 0 || canvasXCoordinate >= context.canvas.width || canvasYCoordinate < 0 || canvasYCoordinate >= context.canvas.height) {
                continue;
            }

            let shouldDisplayPixelRandomNumber = Math.random();
            // pixelData[i + 3] is the alpha component of the pixel
            // Average number of pixels completely not working: 90% * percentDamaged
            // Average number of pixels with random brightness: 10% * percentDamaged
            // So if system is at 50% damage, 45% of pixels should be completely dark and 5% pixels should have random brightness. The remaining 50% of pixels should be functioning as normal.
            if (shouldDisplayPixelRandomNumber < .9 * (100 - percentWorking) / 100) {
                pixelData[i + 3] = 0
            } else if (shouldDisplayPixelRandomNumber < (100 - percentWorking) / 100) {
                pixelData[i + 3] = Math.random() * 255
            }
        }

        context.putImageData(pixels, x, y);
    };

    static drawObjects(objects, context) {
        if (GameConfig.debug) {
            context.save();
            let x = context.canvas.width - 100;
            let y = context.canvas.height - 100;

            // 0,90, and 180 degrees for frame of reference for drawing (in the order RGB)
            context.beginPath();
            context.strokeStyle = "red";
            context.moveTo(x, y);
            context.lineTo(x + 80 * Math.cos(0), y + 80 * Math.sin(0));
            context.stroke();

            context.beginPath();
            context.strokeStyle = "green";
            context.moveTo(x, y);
            context.lineTo(x + 80 * Math.cos(Math.PI / 2), y + 80 * Math.sin(Math.PI / 2));
            context.stroke();

            context.beginPath();
            context.strokeStyle = "blue";
            context.moveTo(x, y);
            context.lineTo(x + 80 * Math.cos(Math.PI), y + 80 * Math.sin(Math.PI));
            context.stroke();

            context.restore();
        }

        for (let i = 0; i < objects.length; i++) {
            // Only draw the objects if they are within the viewing window
            let currentObject = objects[i];
            if (currentObject.x + currentObject.width > 0 &&
                currentObject.x - currentObject.width < context.canvas.width &&
                currentObject.y + currentObject.height > 0 &&
                currentObject.y - currentObject.height < context.canvas.height) {
                context.save();

                currentObject.draw(context, this.scannerEffectContext, this.playerShip.playerSystemsManager.scannerCondition.operatingPercentage);

                context.restore();
            }
        }

        this.numMessageTicks--;
        if (this.numMessageTicks > 0) {
            context.fillStyle = '#af2bd6';
            context.font = '24px digital-dream';
            context.textBaseline = 'bottom';
            context.fillText(this.message, context.canvas.width / 2 - ((this.message.length / 2) * 16.5), context.canvas.height / 2 + 60);
        }
    }

    static drawRadar(objects, context) {
        let contextWidth = context.canvas.width;
        let contextHeight = context.canvas.height;

        // Clear canvas for drawing a new scene
        context.clearRect(0, 0, contextWidth, contextHeight);

        // Based on gameplay footage the original radar scale for the game is about 15 pixels to each pixel of radar
        // However the game is also about 2x more zoomed in than it is in the original game. So we will use half of 15 as the scale
        // of the radar here.
        let sizeOfEachPixelInWorld = 7.5;

        let radarWidthMinimum = this.playerShip.x - ((contextWidth / 2) * sizeOfEachPixelInWorld);
        let radarWidthMaximum = this.playerShip.x + ((contextWidth / 2) * sizeOfEachPixelInWorld);
        let radarHeightMinimum = this.playerShip.y - ((contextHeight / 2) * sizeOfEachPixelInWorld);
        let radarHeightMaximum = this.playerShip.y + ((contextHeight / 2) * sizeOfEachPixelInWorld);

        for (let i = 0; i < objects.length; i++) {
            let currentObject = objects[i];
            // Only draw the objects if they are within the viewing window
            if (currentObject.x + currentObject.width > radarWidthMinimum &&
                currentObject.x - currentObject.width < radarWidthMaximum &&
                currentObject.y + currentObject.height > radarHeightMinimum &&
                currentObject.y - currentObject.height < radarHeightMaximum) {
                context.save();

                let currentObjectLayer = currentObject.layer;
                let radarXLocation = ((currentObject.x - this.playerShip.x) / sizeOfEachPixelInWorld) + (contextWidth / 2);
                let radarYLocation = ((currentObject.y - this.playerShip.y) / sizeOfEachPixelInWorld) + (contextHeight / 2);
                context.beginPath();
                context.strokeStyle = this.getRadarColor(currentObjectLayer);
                context.arc(radarXLocation, radarYLocation, .25, 0, 2 * Math.PI);
                if (currentObjectLayer === Layer.PLAYER_PROJECTILE || currentObjectLayer === Layer.PUFFER_PROJECTILE || currentObjectLayer === Layer.QUAD_BLASTER_PROJECTILE) {
                    // Make projectiles slightly smaller
                    context.lineWidth = 1.2;
                } else {
                    context.lineWidth = 1.5;
                }
                context.stroke();

                // Draw static affect on objects caused by damage to radar
                if (this.playerShip.playerSystemsManager.radarCondition.operatingPercentage < 100) {
                    this.applyStaticEffectToCanvas(context, this.playerShip.playerSystemsManager.radarCondition.operatingPercentage, radarXLocation - 1, radarYLocation - 1, 3, 3, `radar-${currentObject.constructor.name}`);
                }

                if (currentObjectLayer === Layer.PLAYER) {
                    // Draw the area alignment circles indicating player direction, with increasing darkness
                    // This distance is completely unrelated to the value of sizeOfEachPixelInWorld and is based purely off of the size of the radar canvas element
                    // contextWidth and contextHeight should be the same, so just use contextWidth for calculation here.
                    let distanceBetweenCircles = contextWidth / 12;
                    let transparencySteps = "ffddbb9977";
                    for (let multiplier = 0; multiplier < 5; multiplier++) {
                        // Since this is the player location, player is always centered in radar so don't need any other position calculations
                        // Since player angle is facing opposite direction as everything else, add Math.PI to angle to flip it around to match player direction
                        let xLocation = (contextWidth / 2) + distanceBetweenCircles * Math.cos(this.playerShip.angle + Math.PI) * (multiplier + 1);
                        let yLocation = (contextHeight / 2) + distanceBetweenCircles * Math.sin(this.playerShip.angle + Math.PI) * (multiplier + 1);
                        context.beginPath();
                        // Pull two characters from the transparencySteps variable for the alpha (aka opacity) value of the color
                        // For strings the slice arguments are starting index (inclusive) and ending index (exclusive)
                        context.strokeStyle = "#c0c0c0" + transparencySteps.slice(multiplier * 2, (multiplier + 1) * 2);
                        context.arc(xLocation, yLocation, .25, 0, 2 * Math.PI);
                        context.lineWidth = 1.5;
                        context.stroke();

                        // Also need static effect from radar damage on the player direction dots
                        if (this.playerShip.playerSystemsManager.radarCondition.operatingPercentage < 100) {
                            this.applyStaticEffectToCanvas(context, this.playerShip.playerSystemsManager.radarCondition.operatingPercentage, xLocation - 1, yLocation - 1, 3, 3, `radar-direction-dot`);
                        }
                    }
                }

                context.restore();
            }
        }
    }

    static getRadarColor(layer) {
        if (layer === Layer.ASTEROID) {
            return "white";
        } else if (CollisionManager.isEnemyLayer(layer) || layer === Layer.PUFFER_PROJECTILE || layer === Layer.QUAD_BLASTER_PROJECTILE || layer === Layer.ENEMY_BASE_PHOTON || layer === Layer.HAMMERHEAD_WEAPON) {
            return "red";
        } else if (layer === Layer.PLAYER) {
            return "lawngreen";
        } else if (layer === Layer.PLAYER_BASE || layer === Layer.PLAYER_PROJECTILE) {
            return "deepskyblue";
        } else if (CollisionManager.isPowerupLayer(layer)) {
            // NOTE: In the original game is appears that powerups do not show up on the radar at all.
            // I think it is a little more fun to have them show up on the radar, so I am going to have it show as yellow, but have an option in the config to disable it if desired
            if (GameConfig.showPowerupsOnRadar) {
                return "yellow";
            } else {
                // transparent color
                return 'rgba(0,0,0,0)';
            }
        } else {
            // FUTURE TODO: Update logging to have everything use LOGGER, and then make it so certain logging can be turned on and off
            console.error("Unable to determine color for layer " + Object.keys(Layer).find(key => Layer[key] === layer));
        }
    }

    static movePlayerShipTo(x, y) {
        for (let i = 0; i < ObjectManager.objects.length; i++) {
            if (ObjectManager.objects[i] instanceof PlayerShip) continue;
            ObjectManager.objects[i].x -= x;
            ObjectManager.objects[i].y -= y;
            this.checkBounds(ObjectManager.objects[i]);
        }
    }

    static endGame() {
        this.isPaused = true;
        this.isRunning = false;
        ObjectManager.removeObject(this.playerShip);

        const playerScore = LevelManager.score;

        this.highScoreService.getHighscores().then((highscores) => {
            const highscoreSize = highscores.length;
            const lowestScore = highscores[highscoreSize - 1];

            if (highscoreSize < this.NUMBER_OF_HIGH_SCORES_TO_TRACK || lowestScore.score < playerScore) {
                ScreenManager.switchToScreen(Screen.ENTER_HIGHSCORE_SCREEN);
            } else {
                ScreenManager.switchToScreen(Screen.DISPLAY_HIGHSCORES_SCREEN);
            }
        });
    }

    static async submitScoreForUsername(username) {
        const playerScore = LevelManager.score;
        const playerLevel = LevelManager.level;
        const newHighScore = new Score(username, playerLevel, playerScore);
        return this.highScoreService.submitScore(newHighScore).then((highScores) => {
            return {
                allScores: highScores,
                playerScore: playerScore
            };
        });
    }

    static toggleGamePaused(pauseTriggeredByPlayerPressingPause) {
        if (this.isPaused) {
            // Game is currently paused
            // If game was not originally paused by player, unpause regardless
            // OR, if game was originally paused by player, only unpause if this was also caused by player
            if (!GameManager.wasPausedByPlayerPressingPauseKey || pauseTriggeredByPlayerPressingPause) {
                this.resumeGame();
            }
        } else {
            // Game is currently active
            this.pauseGame(pauseTriggeredByPlayerPressingPause);
        }
    }

    static pauseGame(pauseTriggeredByPlayerPressingPause = false) {
        if (pauseTriggeredByPlayerPressingPause) {
            this.wasPausedByPlayerPressingPauseKey = true;
        }
        this.isPaused = true;
        console.log('Paused game, was activated by player pressing pause key:', pauseTriggeredByPlayerPressingPause);
    }

    static resumeGame() {
        this.isPaused = false;
        this.wasPausedByPlayerPressingPauseKey = false;
        this.gameLoop(true);
        this.animationLoop();
        console.log('Resumed game');
    }

    static gameLoop(resetGameTick, advanceOneFrame = false) {
        let loops = 0;
        let shouldAdvanceOneFrame = advanceOneFrame;

        if (resetGameTick === true) {
            GameManager.nextGameTick = (new Date()).getTime();
        }

        while (((new Date()).getTime() > GameManager.nextGameTick && loops < GameManager.MAX_FRAME_SKIP) || (shouldAdvanceOneFrame)) {
            this.updateObjects(ObjectManager.objects);
            this.detectCollisions(ObjectManager.collidables);
            GameManager.nextGameTick += GameManager.SKIP_TICKS;
            loops += 1;

            if (shouldAdvanceOneFrame) {
                shouldAdvanceOneFrame = false;
            }
        }

        // Even if we process 10 frames, we only want to draw once (no point in drawing older frames)
        if (loops) {
            this.drawScene();
        }

        // Update the Level manager to see if we have can advance to the next level
        LevelManager.update(loops);
    }

    static drawScene() {
        // Clear canvases for drawing a new scene
        this.scannerContext.clearRect(0, 0, this.scannerContext.canvas.width, this.scannerContext.canvas.height);
        this.scannerProjectileContext.clearRect(0, 0, this.scannerProjectileContext.canvas.width, this.scannerProjectileContext.canvas.height);

        this.drawObjects(Object.values(ObjectManager.nonProjectileObjects), this.scannerContext);
        this.drawObjects(Object.values(ObjectManager.projectileObjects), this.scannerProjectileContext);
        this.drawRadar(ObjectManager.collidables, this.radarContext);
    }

    static animationLoop() {
        // stop loop if paused
        if (this.isPaused) return;

        // Start the game loop
        this.gameLoop();
        // requestAnimationFrame is a javascript provided function, see https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame for more details
        requestAnimationFrame(this.animationLoop);
    }

    static advanceOneFrame() {
        // Only want to advance one frame if the game is paused, or else it doesn't really make any sense to advance one frame
        if (GameConfig.debug && this.isPaused) {
            console.log("Advancing the game one frame");
            this.gameLoop(true, true);
        }
    }

    static toggleDebugMode() {
        // Toggle debug
        GameConfig.debug = !GameConfig.debug;
        // Update the system labels since they show more/less info depending on if debug mode is on
        this.playerShip.playerSystemsManager.updateAllLabels();
    }

    static stopPlayerMovement() {
        // Only allow stopping of player movement if debug mode is enabled
        if (GameConfig.debug) {
            console.log("Stopping player movement");
            this.playerShip.velocityX = 0;
            this.playerShip.velocityY = 0;
        }
    }
}
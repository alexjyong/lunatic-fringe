import { GameConfig } from "../../config/GameConfig.js";
import { DocumentManager } from "./DocumentManager.js";
import { GameManager } from "./GameManager.js";
import { Layer } from "./Layer.js";
import { MediaManager } from "./MediaManager.js";

export class LevelManager {
    static level;
    static delayFrameCount = 0;
    static inNextLevelDelay = false;
    static DELAY_UNTIL_NEXT_LEVEL_IN_SECONDS = 0.5 * 60;
    /* To keep the game from getting too easy/boring at the end of each level there should be a minimum number of enemies present in the world
        that the level manager keeps track of and uses to determine when to start a next level. 
        To start, during level 1 add this many extra enemies to the game. Then, when determing when the next level should occur the spawn stack
        should be empty and there should be either this many enemies or less still alive. In this way, the next level can start and new enemies
        can start spawning before all of the enemies have been destroyed from the world, making it so it is not too easy for the player at the
        end of a level.
    */

    // Since changing levels to be based on score instead of enemy based, spawning will happen until the currently level cap is reached.
    // This cap rises each level.
    static maximumEnemiesInTheWorld;
    // The score needed to hit the next level
    static scoreForNextLevel;
    // The score additional score required to get to the level after the next level
    static nextScoreLevelIncreaseAmount;
    // The player score
    static score;
    // The possible enemies that can currently be spawned in, indicated by Layer
    static possibleEnemiesToSpawn = [];
    // The weights associated with the possible enemy spawns
    static possibleEnemiesToSpawnWeights;
    // The number of enemies currently alive
    static numberOfEnemiesAlive;
    
    static initializeGame() {
        this.score = 0;
        this.maximumEnemiesInTheWorld = GameConfig.MAXIMUM_NUMBER_OF_ENEMIES_AT_LEVEL_ONE;
        this.scoreForNextLevel = GameConfig.SCORE_NEEDED_FOR_FIRST_LEVEL_UP;
        this.nextScoreLevelIncreaseAmount = this.scoreForNextLevel + GameConfig.SCORE_REQUIREMENT_INCREASE_PER_LEVEL;
        this.numberOfEnemiesAlive = 0;
        this.possibleEnemiesToSpawn = [];
        this.possibleEnemiesToSpawnWeights = [];
        this.setLevel(1);
        for (let i = 0; i < GameConfig.STARTING_NUMBER_OF_POWERUPS; i++) {
            GameManager.spawnRandomPowerup();
        }
    }

    static setLevel(level) {
        this.level = level;

        DocumentManager.updateLevel(this.level);

        if (!this.possibleEnemiesToSpawn.includes(Layer.QUAD_BLASTER) && this.level >= GameConfig.QUADBLASTER_MINIMUM_SPAWN_LEVEL) {
            this.possibleEnemiesToSpawn.push(Layer.QUAD_BLASTER);
            this.possibleEnemiesToSpawnWeights.push(GameConfig.QUADBLASTER_SPAWN_WEIGHT);
        }

        if (!this.possibleEnemiesToSpawn.includes(Layer.SLUDGER) && this.level >= GameConfig.SLUDGER_MINIMUM_SPAWN_LEVEL) {
            this.possibleEnemiesToSpawn.push(Layer.SLUDGER);
            this.possibleEnemiesToSpawnWeights.push(GameConfig.SLUDGER_SPAWN_WEIGHT);
        }

        if (!this.possibleEnemiesToSpawn.includes(Layer.HAMMERHEAD) && this.level >= GameConfig.HAMMERHEAD_MINIMUM_SPAWN_LEVEL) {
            this.possibleEnemiesToSpawn.push(Layer.HAMMERHEAD);
            this.possibleEnemiesToSpawnWeights.push(GameConfig.HAMMERHEAD_SPAWN_WEIGHT);
        }

        if (!this.possibleEnemiesToSpawn.includes(Layer.PUFFER) && this.level >= GameConfig.PUFFER_MINIMUM_SPAWN_LEVEL) {
            this.possibleEnemiesToSpawn.push(Layer.PUFFER);
            this.possibleEnemiesToSpawnWeights.push(GameConfig.PUFFER_SPAWN_WEIGHT);
        }

        if (!this.possibleEnemiesToSpawn.includes(Layer.SLICER) && this.level >= GameConfig.SLICER_MINIMUM_SPAWN_LEVEL) {
            this.possibleEnemiesToSpawn.push(Layer.SLICER);
            this.possibleEnemiesToSpawnWeights.push(GameConfig.SLICER_SPAWN_WEIGHT);
        }
    }

    static updateScore(scoreChange) {
        this.score += scoreChange;

        DocumentManager.updateScore(this.score);
    }

    static getEnemyToSpawn() {
        this.numberOfEnemiesAlive++;

        let totalWeight = this.possibleEnemiesToSpawnWeights.reduce((sum, weight) => sum + weight, 0);
        let random = Math.random() * totalWeight;
        let currentWeight = 0;
      
        for (let i = 0; i < this.possibleEnemiesToSpawn.length; i++) {
          currentWeight += this.possibleEnemiesToSpawnWeights[i];
          if (random < currentWeight) {
            return this.possibleEnemiesToSpawn[i];
          }
        }
    }

    static shouldActivateNextLevel() {
        return this.score >= this.scoreForNextLevel;
    }

    static activateNextLevel() {
        // Set the next level
        this.setLevel(this.level + 1);

        // Give the player a message telling them what level they are on
        GameManager.displayMessage(`Level ${this.level}`, 3 * 60);

        // Play new level sound
        MediaManager.Audio.NewLevel.play();

        // Update score threadholds for next level
        this.scoreForNextLevel += this.nextScoreLevelIncreaseAmount;
        this.nextScoreLevelIncreaseAmount += GameConfig.SCORE_REQUIREMENT_INCREASE_PER_LEVEL;
        this.maximumEnemiesInTheWorld++;
    }

    static update(frameCount) {
        if (this.shouldActivateNextLevel()) {
            // Next level delay is used to create a slight delay between an enemy being killed and starting the next level
            // This also helps prevent the enemy death sound and next level sound from overlapping
            if (this.inNextLevelDelay) {
                this.delayFrameCount += frameCount;
                if (this.delayFrameCount >= this.DELAY_UNTIL_NEXT_LEVEL_IN_SECONDS) {
                    this.activateNextLevel();
                    this.delayFrameCount = 0;
                    this.inNextLevelDelay = false;
                }
            } else {
                this.inNextLevelDelay = true;
            }
        }
    }
}
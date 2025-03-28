import { GameConfig } from "../../config/GameConfig.js";

// Create an "Enum" for the game bounds
export const GameBoundSize = GameConfig.HALF_OF_WORLD_SIZE;

export const GameBound = {
    LEFT: -GameBoundSize,
    TOP: -GameBoundSize,
    RIGHT: GameBoundSize,
    BOTTOM: GameBoundSize
}
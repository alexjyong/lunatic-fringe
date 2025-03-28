import { ScreenManager } from "./ScreenManager.js";

export const Key = {
    ENTER: 13,
    SHIFT: 16,
    CTRL: 17,
    SPACE: 32,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
	CAPSLOCK: 20,
    A: 65,
    D: 68,
	V: 86,
	B: 66,
	K: 75,
    S: 83
}

export class KeyStateManager {
    static keysPressed = {};

    static isDown(keyCode) {
        return this.keysPressed[keyCode];
    }

    static onKeyDown(event) {
        if (this.keysPressed[event.keyCode] !== true) {
            // This was the first time the key was pressed
            ScreenManager.handleKeyDown(event.keyCode);
        }
        
        this.keysPressed[event.keyCode] = true;
    }

    static onKeyUp(event) {
        if (this.keysPressed[event.keyCode] === true) {
            // This was the first time the key was un-pressed
            ScreenManager.handleKeyUp(event.keyCode);
        }

        delete this.keysPressed[event.keyCode];
    }
}
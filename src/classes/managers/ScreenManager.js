import { Score } from "../../scoring/Score.js";
import { DocumentManager } from "./DocumentManager.js";
import { GameManager } from "./GameManager.js";
import { Key } from "./KeyManager.js";
import { LevelManager } from "./LevelManager.js";
import { GamePadManager } from "./GamePadManager.js"

// Note: These match the id values in the html file
export const Screen = {
  INFO_AND_PLOT_SCREEN: 'info-and-plot-screen',
  GAMEPLAY_SCREEN: 'game-screen',
  ENTER_HIGHSCORE_SCREEN: 'enter-new-highscore-screen',
  DISPLAY_HIGHSCORES_SCREEN: 'display-highscores-screen',
  BESTIARY_SCREEN: 'bestiary-screen',
  HELP_SCREEN: 'help-screen' // TODO: Determine if this was a separate screen or is just another name for one of the other existing screens
}

export class ScreenManager {
  static STARTING_SCREEN = Screen.INFO_AND_PLOT_SCREEN;
  static currentScreen = this.STARTING_SCREEN;

  static HIGH_SCORE_INPUT_ID = 'enter-new-highscore-input';
  static HIGH_SCORE_ENTITY_INFO_TEXT_ID = 'highscore-screen-entity-info-text';
  static HIGH_SCORE_CURRENT_GAME_INFO_TEXT_ID = 'highscore-screen-current-game-info-text';
  static BESTIARY_HELP_TEXT_ID = 'bestiary-screen-help-text';

  static handleKeyDown(key) {
    switch (this.currentScreen) {
      case Screen.INFO_AND_PLOT_SCREEN:
        // Any key press causes switch to gameplay screen
        this.switchToScreen(Screen.GAMEPLAY_SCREEN);
        break;
      case Screen.GAMEPLAY_SCREEN:
        if (key === Key.CAPSLOCK) {
          // If caps locks was pressed, handle pausing/unpausing depending on the current state
          GameManager.toggleGamePaused(true);
        } else if (key === Key.A) {
          // If A was pressed, call game manager
          // to handle advancing the game by one frame (useful for debugging)
          GameManager.advanceOneFrame();
        } else if (key === Key.D) {
          // If D was pressed, toggle debug in the game config
          // That way it starts whatever way is defined in the config, but can be toggled with a key press.
          GameManager.toggleDebugMode();
        } else if (key === Key.S) {
          // If S was pressed, call game manager to
          // set the player velocity to 0 to stop the player in place (useful for debugging)
          GameManager.stopPlayerMovement();
        } else if (key === Key.CTRL) {
          GameManager.toggleGamePaused(false);
          this.switchToScreen(Screen.DISPLAY_HIGHSCORES_SCREEN);
        } else if (key === Key.SHIFT) {
          GameManager.toggleGamePaused(false);
          this.switchToScreen(Screen.BESTIARY_SCREEN);
        }
        break;
      case Screen.ENTER_HIGHSCORE_SCREEN:
        break;
      case Screen.DISPLAY_HIGHSCORES_SCREEN:
        if (key === Key.CTRL && !GameManager.isGameRunning()) {
          this.switchToScreen(Screen.GAMEPLAY_SCREEN);
        } else if (key === Key.SHIFT && !GameManager.isGameRunning()) {
          this.switchToScreen(Screen.BESTIARY_SCREEN);
        }
        break;
      case Screen.BESTIARY_SCREEN:
        break;
      case Screen.HELP_SCREEN:
        break;
      default:
        throw new Error(`Unknown screen type ${this.currentScreen}`);
    }
  }

  static handleKeyUp(key) {
    switch (this.currentScreen) {
      case Screen.INFO_AND_PLOT_SCREEN:
        break;
      case Screen.GAMEPLAY_SCREEN:
        break;
      case Screen.ENTER_HIGHSCORE_SCREEN:
        const enteredName = DocumentManager.getValueOfInputElement(this.HIGH_SCORE_INPUT_ID);
        if (key === Key.ENTER && enteredName) {
          GameManager.submitScoreForUsername(enteredName).then((scoreInformation) => {
            this.switchToScreen(Screen.DISPLAY_HIGHSCORES_SCREEN, { allScores: scoreInformation.allScores, scoreToHighlight: scoreInformation.playerScore });
          });
        }
        break;
      case Screen.DISPLAY_HIGHSCORES_SCREEN:
        if (key === Key.CTRL && GameManager.isGameRunning()) {
          this.switchToScreen(Screen.GAMEPLAY_SCREEN);
          GameManager.toggleGamePaused(false);
        }
        break;
      case Screen.BESTIARY_SCREEN:
        if (key === Key.SHIFT && GameManager.isGameRunning()) {
          this.switchToScreen(Screen.GAMEPLAY_SCREEN);
          GameManager.toggleGamePaused(false);
        } else if (key === Key.SHIFT && !GameManager.isGameRunning()) {
          this.switchToScreen(Screen.DISPLAY_HIGHSCORES_SCREEN);
        }
        break;
      case Screen.HELP_SCREEN:
        break;
      default:
        throw new Error(`Unknown screen type ${this.currentScreen}`);
    }
  }

  static switchToScreen(newScreen, otherOptions) {
    DocumentManager.markScreenAsHidden(this.currentScreen);
    DocumentManager.markScreenAsShowing(newScreen);
    this.currentScreen = newScreen;

    if (newScreen === Screen.GAMEPLAY_SCREEN) {
      if (GameManager.isGameRunning()) {
        // Account for any resizing that happened while we were not on the gameplay screen
        GameManager.handleResize();
      } else {
        GameManager.setupGame();
      }

    }

    if (newScreen === Screen.ENTER_HIGHSCORE_SCREEN) {
      DocumentManager.focusOnElement(this.HIGH_SCORE_INPUT_ID);
    }

    if (newScreen === Screen.DISPLAY_HIGHSCORES_SCREEN) {
      if (otherOptions) {
        DocumentManager.updateHighScoresElements(otherOptions.allScores, otherOptions.scoreToHighlight);
      }
      
      if (!GameManager.isGameRunning()) {
        DocumentManager.updateElementTextByElementName(this.HIGH_SCORE_ENTITY_INFO_TEXT_ID, 'Hold Shift for Entity information.');
        DocumentManager.updateElementTextByElementName(this.HIGH_SCORE_CURRENT_GAME_INFO_TEXT_ID, 'Press Ctrl to re-enter the Fringe...');
      } else {
        DocumentManager.updateElementTextByElementName(this.HIGH_SCORE_ENTITY_INFO_TEXT_ID, '');
        DocumentManager.updateElementTextByElementName(this.HIGH_SCORE_CURRENT_GAME_INFO_TEXT_ID, 'Release Ctrl to return...');
      }
    }
  }
}

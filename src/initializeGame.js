import { GameManager } from './classes/managers/GameManager.js';
import { KeyStateManager } from './classes/managers/KeyManager.js';
import { MediaManager } from './classes/managers/MediaManager.js';
import { GamePadManager } from "./classes/managers/GamePadManager.js"
import { MobileControlManager } from "./classes/managers/MobileControlManager.js"

window.onload = function Initialize() {
    let version = "5.0";
    console.log("Game Version: " + version);

    // Initialize the media (audio/sprites)
    MediaManager.init();
    
    // Initialize GamePad only on touch devices
    const isTouchDevice = ('ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0);
    
    console.log('Touch detection:', {
        ontouchstart: 'ontouchstart' in window,
        maxTouchPoints: navigator.maxTouchPoints,
        msMaxTouchPoints: navigator.msMaxTouchPoints,
        isTouchDevice: isTouchDevice
    });
    
    if (isTouchDevice) {
        const gamepad = new GamePadManager();
        const mobileControls = new MobileControlManager();
        
        // Add touch device class to enable gamepad visibility
        document.documentElement.classList.add('touch-device');
        
        // Make sure gamepad is visible on touch devices
        const gamepadElement = document.getElementById('HudGamePad');
        if (gamepadElement) {
            gamepadElement.style.display = 'block';
        }
        
        console.log('Touch device detected - GamePad and Mobile Controls initialized');
    } else {
        // Add no-touch class and explicitly hide gamepad on desktop
        document.documentElement.classList.add('no-touch-device');
        
        const gamepadElement = document.getElementById('HudGamePad');
        if (gamepadElement) {
            gamepadElement.style.display = 'none';
        }
        
        console.log('Non-touch device - GamePad not initialized');
    }

    // This is simpler than parsing the query string manually. The better regex solutions gave JSLint hell so I removed them.
    if (window.location.href.indexOf("debug=1") !== -1) {
        GameConfig.debug = true;
    }


    // Determine the current hidden and visibility change properties based on browser
    let hiddenValueNuame, visibilityChangeValueName;
    if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support 
        hiddenValueNuame = "hidden";
        visibilityChangeValueName = "visibilitychange";
    } else if (typeof document.mozHidden !== "undefined") {
        hiddenValueNuame = "mozHidden";
        visibilityChangeValueName = "mozvisibilitychange";
    } else if (typeof document.msHidden !== "undefined") {
        hiddenValueNuame = "msHidden";
        visibilityChangeValueName = "msvisibilitychange";
    } else if (typeof document.webkitHidden !== "undefined") {
        hiddenValueNuame = "webkitHidden";
        visibilityChangeValueName = "webkitvisibilitychange";
    }

    // Opera sort of blows and doesn't support Object.create at this time
    if (typeof Object.create !== 'function') {
        Object.create = function (o) {
            function F() { }
            F.prototype = o;
            return new F();
        };
    }

    // Add listeners
    function handleVisibilityChange() {
        console.log('visibility change!', document[hiddenValueNuame])
        if (document[hiddenValueNuame]) {
            // Only pause the game if the game is not already paused
            if (!GameManager.isPaused) {
                GameManager.pauseGame();
            }
        } else {
            // Only resume the game if the game is currently paused and was not paused by a key press.
            // Do this so that if the player pauses with a key press and then leaves the browser window 
            // the game won't unpause until they explicitly do that key press again.
            if (GameManager.isPaused && !GameManager.wasPausedByPlayerPressingPauseKey) {
                GameManager.resumeGame();
            }
        }
    }
    document.addEventListener(visibilityChangeValueName, handleVisibilityChange, false);
    window.addEventListener('resize', function (event) { GameManager.handleResize(event); }, false);
    window.addEventListener('keyup', function (event) { KeyStateManager.onKeyUp(event); }, false);
    window.addEventListener('keydown', function (event) { KeyStateManager.onKeyDown(event); }, false);
    
    // Add touch event handling for mobile
    window.addEventListener('touchstart', function(event) {
        // Prevent default touch behavior that might interfere with the game
        if (event.target.closest('#HudGamePad') || event.target.closest('canvas')) {
            event.preventDefault();
        }
    }, { passive: false });
    
    window.addEventListener('touchmove', function(event) {
        // Prevent scrolling when touching game area
        if (event.target.closest('#HudGamePad') || event.target.closest('canvas')) {
            event.preventDefault();
        }
    }, { passive: false });
}
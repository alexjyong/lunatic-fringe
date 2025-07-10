import { GamePad } from 'https://unpkg.com/hud-gamepad/src/index.js';
import { KeyStateManager, Key } from './KeyManager.js';

export class GamePadManager {
  buttons = [
    { name: "a", color: "rgba(255,0,0,0.6)", key: "shoot" },
    { name: "b", color: "rgba(0,255,0,0.6)", key: "accelerate" },
    { name: "x", color: "rgba(0,100,255,0.6)", key: "power_shield" },
    { name: "y", color: "rgba(255,100,255,0.6)", key: "turbo_thrust" }
  ];
  start = { name: "start", color: "rgba(100,100,100,0.5)", key: "pause" };
  select = { name: "select", color: "rgba(100,100,100,0.5)", key: "select" };

  currentKeys = {};
  hapticSupported = navigator.vibrate !== undefined;

  constructor() {
    GamePad.setup({
      joystick: true,
      buttons: this.buttons,
      start: this.start,
      select: this.select,
      trace: false,
      hint: false,
    });

    // Listen for gamepad button events directly
    this.setupDirectEventListeners();

    console.log('GamePadManager initialized with direct event handling and haptic feedback');
  }

  setupDirectEventListeners() {
    // Listen for button press events from the HUD GamePad
    document.addEventListener('gamepadbutton', (event) => {
      const buttonName = event.detail.button;
      console.log('Button pressed:', buttonName, 'Event:', event);
      
      // Map button names to key codes
      switch(buttonName) {
        case 'a':
          console.log('Shooting! Simulating SPACE key');
          this.simulateKeyEvent('keydown', Key.SPACE); // Shoot
          this.triggerHapticFeedback('shoot');
          break;
        case 'b':
          console.log('Accelerating! Simulating UP key');
          this.simulateKeyEvent('keydown', Key.UP); // Accelerate
          this.triggerHapticFeedback('accelerate');
          break;
        case 'x':
          console.log('Power shield! Simulating V key');
          this.simulateKeyEvent('keydown', Key.V); // Power shield
          this.triggerHapticFeedback('power_shield');
          break;
        case 'y':
          console.log('Turbo thrust! Simulating B key');
          this.simulateKeyEvent('keydown', Key.B); // Turbo thrust
          this.triggerHapticFeedback('turbo_thrust');
          break;
        case 'start':
          console.log('Pausing! Simulating CAPSLOCK key');
          this.simulateKeyEvent('keydown', Key.CAPSLOCK); // Pause
          this.triggerHapticFeedback('pause');
          break;
        case 'select':
          console.log('Select! Simulating CTRL key');
          this.simulateKeyEvent('keydown', Key.CTRL); // Select
          this.triggerHapticFeedback('select');
          break;
      }
    });

    // Listen for button release events
    document.addEventListener('gamepadbuttonup', (event) => {
      const buttonName = event.detail.button;
      console.log('Button released:', buttonName);
      
      // Map button names to key codes for release
      switch(buttonName) {
        case 'a':
          this.simulateKeyEvent('keyup', Key.SPACE);
          break;
        case 'b':
          this.simulateKeyEvent('keyup', Key.UP);
          break;
        case 'x':
          this.simulateKeyEvent('keyup', Key.V);
          break;
        case 'y':
          this.simulateKeyEvent('keyup', Key.B);
          break;
        case 'start':
          this.simulateKeyEvent('keyup', Key.CAPSLOCK);
          break;
        case 'select':
          this.simulateKeyEvent('keyup', Key.CTRL);
          break;
      }
    });

    // Also listen for click events on buttons as a fallback
    document.addEventListener('click', (event) => {
      if (event.target.closest('#HudGamePad button')) {
        const button = event.target.closest('button');
        const buttonText = button.textContent.toLowerCase();
        console.log('Button clicked:', buttonText, button);
        
        // Map button text to actions
        switch(buttonText) {
          case 'a':
            console.log('Click: Shooting!');
            this.simulateKeyEvent('keydown', Key.SPACE);
            setTimeout(() => this.simulateKeyEvent('keyup', Key.SPACE), 100);
            this.triggerHapticFeedback('shoot');
            break;
          case 'b':
            console.log('Click: Accelerating!');
            this.simulateKeyEvent('keydown', Key.UP);
            setTimeout(() => this.simulateKeyEvent('keyup', Key.UP), 100);
            this.triggerHapticFeedback('accelerate');
            break;
          case 'x':
            console.log('Click: Power shield!');
            this.simulateKeyEvent('keydown', Key.V);
            setTimeout(() => this.simulateKeyEvent('keyup', Key.V), 100);
            this.triggerHapticFeedback('power_shield');
            break;
          case 'y':
            console.log('Click: Turbo thrust!');
            this.simulateKeyEvent('keydown', Key.B);
            setTimeout(() => this.simulateKeyEvent('keyup', Key.B), 100);
            this.triggerHapticFeedback('turbo_thrust');
            break;
          case 'start':
            console.log('Click: Pausing!');
            this.simulateKeyEvent('keydown', Key.CAPSLOCK);
            setTimeout(() => this.simulateKeyEvent('keyup', Key.CAPSLOCK), 100);
            this.triggerHapticFeedback('pause');
            break;
        }
      }
    });

    // Also listen for any other gamepad events to see what's available
    document.addEventListener('gamepadstart', (event) => {
      console.log('Gamepad started:', event);
    });

    document.addEventListener('gamepadend', (event) => {
      console.log('Gamepad ended:', event);
    });

    document.addEventListener('gamepadmove', (event) => {
      console.log('Gamepad move:', event.detail);
    });
  }

  triggerHapticFeedback(keyName) {
    if (!this.hapticSupported) return;
    
    let intensity = 50;
    
    // Different haptic intensities for different actions
    switch (keyName) {
      case 'shoot':
        intensity = 100; // Strong haptic for shooting
        break;
      case 'accelerate':
        intensity = 70; // Medium haptic for thrust
        break;
      case 'power_shield':
      case 'turbo_thrust':
        intensity = 80; // Medium-strong haptic for powerups
        break;
      case 'pause':
        intensity = 60; // Medium haptic for pause
        break;
      default:
        intensity = 50;
    }
    
    navigator.vibrate(intensity);
  }

  simulateKeyEvent(eventType, keyCode) {
    // Create a synthetic keyboard event
    const event = {
      keyCode: keyCode,
      preventDefault: () => {},
      stopPropagation: () => {}
    };

    console.log(`Simulating ${eventType} with keyCode ${keyCode}:`, event);

    try {
      if (eventType === 'keydown') {
        console.log('Calling KeyStateManager.onKeyDown');
        KeyStateManager.onKeyDown(event);
      } else if (eventType === 'keyup') {
        console.log('Calling KeyStateManager.onKeyUp');
        KeyStateManager.onKeyUp(event);
      }
    } catch (error) {
      console.error('Error simulating key event:', error);
    }
  }
}

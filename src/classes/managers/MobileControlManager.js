import { KeyStateManager, Key } from './KeyManager.js';

export class MobileControlManager {
    constructor() {
        this.isActive = false;
        this.joystickData = { x: 0, y: 0, active: false };
        this.lastAngle = 0;
        this.isAutoSteering = true; // Modern twin-stick style controls
        this.hapticSupported = navigator.vibrate !== undefined;
        this.lastHapticTime = 0;
        this.debugMode = window.location.href.includes('debug=1');
        
        this.setupEventListeners();
        console.log('MobileControlManager initialized with modern controls and haptic feedback');
        
        if (this.debugMode) {
            this.setupDebugDisplay();
        }
    }

    setupEventListeners() {
        // Listen for gamepad events from the HUD GamePad
        document.addEventListener('gamepadmove', (event) => {
            this.handleJoystickMove(event.detail);
        });

        document.addEventListener('gamepadstart', () => {
            this.isActive = true;
            this.triggerHapticFeedback(50); // Light haptic on touch start
        });

        document.addEventListener('gamepadend', () => {
            this.isActive = false;
            this.joystickData = { x: 0, y: 0, active: false };
            this.triggerHapticFeedback(30); // Light haptic on touch end
        });

        // Listen for button presses to add haptic feedback
        document.addEventListener('gamepadbutton', (event) => {
            this.triggerHapticFeedback(80); // Medium haptic for button presses
        });
    }

    triggerHapticFeedback(intensity = 50) {
        if (!this.hapticSupported) return;
        
        const now = Date.now();
        if (now - this.lastHapticTime < 100) return; // Throttle haptic feedback
        
        this.lastHapticTime = now;
        navigator.vibrate(intensity);
    }

    handleJoystickMove(data) {
        this.joystickData = data;
        
        if (!data.active) {
            // Joystick released - stop turning and accelerating
            this.simulateKeyUp(Key.LEFT);
            this.simulateKeyUp(Key.RIGHT);
            this.simulateKeyUp(Key.UP);
            return;
        }

        const { x, y } = data;
        const magnitude = Math.sqrt(x * x + y * y);
        
        if (magnitude < 0.15) {
            // Dead zone - stop all movement
            this.simulateKeyUp(Key.LEFT);
            this.simulateKeyUp(Key.RIGHT);
            this.simulateKeyUp(Key.UP);
            return;
        }

        // Calculate angle from joystick position
        const targetAngle = Math.atan2(-y, x); // Negative Y because screen coordinates are flipped
        
        if (this.isAutoSteering) {
            // Modern control scheme: joystick direction sets ship direction and speed
            this.autoSteerToAngle(targetAngle, magnitude);
            
            // Accelerate based on joystick magnitude
            if (magnitude > 0.3) {
                this.simulateKeyDown(Key.UP);
                
                // Add subtle haptic feedback for thrust
                if (magnitude > 0.7) {
                    this.triggerHapticFeedback(20);
                }
            } else {
                this.simulateKeyUp(Key.UP);
            }
        } else {
            // Classic control scheme: left/right turn, up accelerates
            if (Math.abs(x) > 0.3) {
                if (x > 0) {
                    this.simulateKeyDown(Key.RIGHT);
                    this.simulateKeyUp(Key.LEFT);
                } else {
                    this.simulateKeyDown(Key.LEFT);
                    this.simulateKeyUp(Key.RIGHT);
                }
            } else {
                this.simulateKeyUp(Key.LEFT);
                this.simulateKeyUp(Key.RIGHT);
            }

            // Accelerate if joystick is pushed up
            if (y < -0.3) {
                this.simulateKeyDown(Key.UP);
            } else {
                this.simulateKeyUp(Key.UP);
            }
        }
    }

    autoSteerToAngle(targetAngle, magnitude) {
        // Improved auto-steering with smoother turning
        const angleDiff = this.normalizeAngle(targetAngle - this.lastAngle);
        const turnSensitivity = 0.08; // Adjust this to make turning more or less sensitive
        
        if (Math.abs(angleDiff) > turnSensitivity) {
            // Determine turn direction and intensity
            const turnIntensity = Math.min(Math.abs(angleDiff) / Math.PI, 1.0);
            
            if (angleDiff > 0) {
                this.simulateKeyDown(Key.RIGHT);
                this.simulateKeyUp(Key.LEFT);
            } else {
                this.simulateKeyDown(Key.LEFT);
                this.simulateKeyUp(Key.RIGHT);
            }
            
            // Update last angle gradually for smoother control
            this.lastAngle = this.lerp(this.lastAngle, targetAngle, 0.3);
        } else {
            // Stop turning when close to target angle
            this.simulateKeyUp(Key.LEFT);
            this.simulateKeyUp(Key.RIGHT);
            this.lastAngle = targetAngle;
        }
    }

    lerp(start, end, factor) {
        return start + (end - start) * factor;
    }

    normalizeAngle(angle) {
        while (angle > Math.PI) angle -= 2 * Math.PI;
        while (angle < -Math.PI) angle += 2 * Math.PI;
        return angle;
    }

    simulateKeyDown(keyCode) {
        const event = {
            keyCode: keyCode,
            preventDefault: () => {},
            stopPropagation: () => {}
        };
        KeyStateManager.onKeyDown(event);
    }

    simulateKeyUp(keyCode) {
        const event = {
            keyCode: keyCode,
            preventDefault: () => {},
            stopPropagation: () => {}
        };
        KeyStateManager.onKeyUp(event);
    }

    toggleControlScheme() {
        this.isAutoSteering = !this.isAutoSteering;
        console.log('Control scheme:', this.isAutoSteering ? 'Modern (auto-steering)' : 'Classic (manual turning)');
        return this.isAutoSteering;
    }

    setupDebugDisplay() {
        // Create debug overlay
        const debugDiv = document.createElement('div');
        debugDiv.id = 'mobile-debug';
        debugDiv.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            font-size: 12px;
            z-index: 10000;
            min-width: 200px;
        `;
        document.body.appendChild(debugDiv);
        
        // Update debug info every frame
        setInterval(() => {
            this.updateDebugDisplay();
        }, 100);
    }

    updateDebugDisplay() {
        const debugDiv = document.getElementById('mobile-debug');
        if (!debugDiv) return;
        
        debugDiv.innerHTML = `
            <div>Touch Device: ${('ontouchstart' in window) ? 'YES' : 'NO'}</div>
            <div>Gamepad Active: ${this.isActive ? 'YES' : 'NO'}</div>
            <div>Joystick: x=${this.joystickData.x?.toFixed(2) || 0}, y=${this.joystickData.y?.toFixed(2) || 0}</div>
            <div>Magnitude: ${Math.sqrt((this.joystickData.x || 0)**2 + (this.joystickData.y || 0)**2).toFixed(2)}</div>
            <div>Auto-Steering: ${this.isAutoSteering ? 'ON' : 'OFF'}</div>
            <div>Haptic Support: ${this.hapticSupported ? 'YES' : 'NO'}</div>
            <div>Last Angle: ${this.lastAngle.toFixed(2)}</div>
        `;
    }
}

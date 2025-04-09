import { MultiKeyHandler } from 'https://unpkg.com/multi-key-handler/index.js';
import { GamePad } from 'https://unpkg.com/hud-gamepad/src/index.js';

export class GamePadManager {
  buttons = [
    { name: "a", color: "rgba(255,0,0,0.5)", key: "space" },
    { name: "b", color: "rgba(0,255,0,0.5)", key: "a" },
    { name: "x", color: "rgba(0,0,255,0.5)", key: "w" },
    { name: "y", color: "rgba(255,0,255,0.5)", key: "q" }
  ];
  start = { name: "start", key: "b" };
  select = { name: "select", key: "v" };

  constructor() {
    const keys = this.buttons.map(({ key }) => key).join("") + this.start.key + this.select.key;

    GamePad.setup({
      joystick: true,
      buttons: this.buttons,
      start: this.start,
      select: this.select,
      trace: true,
      hint: true,
    });

    const multikey = new MultiKeyHandler((keys) => {
      GamePad.events(keys);
    }, { keys, arrows: true, debug: false });

    // Optional: make `multikey` accessible as a class property
    this.multikey = multikey;
  }
}

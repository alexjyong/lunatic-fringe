export let GameConfig = {
    debug: false,
    showPowerupsOnRadar: true,

    /*
    As I review gameplay footage and find offical values for parts of the games
    I will add the values here so that I know it is the official value. Keeping the
    values in a config also opens the door for allowing someone to tweak the values
    to their enjoyment when they play.
    */

   // Default playing shooting speed. Represents the number of frames that must pass before a bullet can be shoot again.
   // A speed of 13 matches up best with the original game's rate of fire at 60fps
   DEFAULT_SHOOTING_SPEED: 13,

   // Duration that the Power Shield (invulnerability) powerup lasts
   POWER_SHIELD_DURATION_IN_SECONDS: 40,

   // Number of shots the Large Photon power up lasts
   LARGE_PHOTON_NUMBER_OF_SHOTS: 10,

   // Number of shots the Spreadshot power up lasts
   SPREAD_SHOT_NUMBER_OF_SHOTS: 30,

   // Number of seconds the player is invulnerable after spawning in or respawning after death. Ideally this should be the
   // same length as LENGTH_OF_FADE_IN_AFTER_SPAWN_IN_SECONDS to prevent confusion.
   LENGTH_OF_INVULNERABILITY_AFTER_SPAWN_IN_SECONDS: 4,

   // How long it takes the player to fade in after spawning/respawning. Ideally this should be the same length as 
   // LENGTH_OF_INVULNERABILITY_AFTER_SPAWN_IN_SECONDS to prevent confusion.
   LENGTH_OF_FADE_IN_AFTER_SPAWN_IN_SECONDS: 4,

   // The point interval where the player will recieve another life. This interval is repeated, for example if the value is 3000
   // then the player will recieve new lives at 3000 points, 6000 points, 9000 points, and so on. 
   POINT_INTERVAL_VALUE_FOR_EXTRA_LIFE: 3000
};
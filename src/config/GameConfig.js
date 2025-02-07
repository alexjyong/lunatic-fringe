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

   // Duration that the Turbo Boost powerup lasts
   TURBO_BOOST_DURATION_IN_SECONDS: 1.5,

   // Duration that the Double Points powerup lasts
   DOUBLE_POINTS_DURATION_IN_SECONDS: 35,

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
   POINT_INTERVAL_VALUE_FOR_EXTRA_LIFE: 3000,

   // The number of points a sluder mine is worth
   SLUDGERMINE_POINT_VALUE: 2,

   // The number of points a sludger is worth
   SLUDGER_POINT_VALUE: 50,

   // The number of points a quadblaster is worth
   QUADBLASTER_POINT_VALUE: 50,

   // The number of points a hammerhead is worth
   HAMMERHEAD_POINT_VALUE: 100,

   // The number of points a puffer is worth
   PUFFER_POINT_VALUE: 100,

   // The number of points a slicer is worth
   SLICER_POINT_VALUE: 200,

   // The level that each enemy can first start appearing
   QUADBLASTER_MINIMUM_SPAWN_LEVEL: 1,
   SLUDGER_MINIMUM_SPAWN_LEVEL: 1,
   HAMMERHEAD_MINIMUM_SPAWN_LEVEL: 1,
   PUFFER_MINIMUM_SPAWN_LEVEL: 4,
   SLICER_MINIMUM_SPAWN_LEVEL: 7,
   
   // Based on pixel measurements from gameplay the original game area was roughly 6000x6000
   HALF_OF_WORLD_SIZE: 3000,


   /** ----------------------------- UNCONFIRMED GAME VALUES ----------------------------- **/
   // Below are game values that need to be confirmed or checked and then adjusted based on their
   // actual gameplay value. Below are my best estimates for what the values should be, putting
   // into the config so that it is easy to adjust the values in the future.

   // The length of time a sludger mine will remain alive until it dies on its own.
   // Based on gameplay footage https://www.youtube.com/watch?v=zZglGbYGRtI at 28:10 the lifetime is at least 20 seconds (can see
   // sludger mines approaching on the radar during that time). So my best guess at the moment is that the lifetime is 30.
   SLUDGERMINE_LIFETIME_IN_SECONDS: 30,

   
   // Score needed for the level up from level 1 to level 2
   // This seems to match best with gameplay footage I found but isn't completely confirmed
   SCORE_NEEDED_FOR_FIRST_LEVEL_UP: 525,

   // How much the number of points needed to get the next level increases per level
   // This seems to match best with gameplay footage I found but isn't completely confirmed
   SCORE_REQUIREMENT_INCREASE_PER_LEVEL: 25,

   // The weights for how frequently each enemy spawns compared to the others
   // I have no idea what these values should be, so I made educated guesses
   QUADBLASTER_SPAWN_WEIGHT: 4,
   SLUDGER_SPAWN_WEIGHT: 4,
   HAMMERHEAD_SPAWN_WEIGHT: 4,
   PUFFER_SPAWN_WEIGHT: 4,
   SLICER_SPAWN_WEIGHT: 1,

   // The maximum number of enemies at level 1
   // This might not even be a thing the game does, but seems like a good idea to limit enemies at the start
   // and then slowly increase over time
   MAXIMUM_NUMBER_OF_ENEMIES_AT_LEVEL_ONE: 5,

   // The number of powerups that start in the world. I can only guess but based on gameplay footage at least 1 is available
   // at level one, but at least 3 are available at level 3. With the way I am handling powerups, the world should start with
   // three as new powerups only spawn when other powerups are taken
   STARTING_NUMBER_OF_POWERUPS: 3,

   // What percentage to vary the normal spawning location of the enemy base. Should be between 0 and 1.
   // When 0, the enemy base always spawns in the same spot, exactly half of the world size away in both directions.
   // When 0.50, the enemy base can spawn with a variation of up 50% of the GameBounds away from the normal spawn point
   // When 1, the enemy base can spawn with a variation of up to 100% of the GameBounds away from the normal spawn point, which effectively
   // means it could spawn anywhere in the world, including next to the player base.
   // Using 0.40 seems to be a good middle ground that can't spawn too close to player base but also isn't always in a predictable spot.
   ENEMY_BASE_SPAWN_VARIATION_PERCENTAGE: 0.40,
};
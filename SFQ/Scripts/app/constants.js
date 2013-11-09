define('constants',
    [], function() {


        return {
            //keys
            KEY_UP: 38,
            KEY_LEFT: 37,
            KEY_RIGHT: 39,
            KEY_DOWN: 40,
            KEY_SPACE: 32,
            KEY_Z: 90,
            KEY_LCTRL: 17,
            KEY_S: 83,
            
            //world constants
            WORLD_WIDTH: 720,
            WORLD_HEIGHT: 528,            
            NUM_ROWS: 11,
            NUM_COLUMNS: 15,
            FPS:30,
            GRAVITY: 2,
            MOVE_SPEED: 10,

            //asset constants
            CREATURES_IN_ROW: 18,
            CREATURES_IN_COLUMN: 11,
            TILE_SIZE: 48,
        };
    });
define('constants',
    [], function() {
        return {           
            //world constants
            WORLD_WIDTH: 720,
            WORLD_HEIGHT: 528,            
            NUM_ROWS: 11,
            NUM_COLUMNS: 15,
            FPS:30,
            GRAVITY: 2,
            MOVE_SPEED: 10,
            CHANCE_OF_NEW_NPC: 0.5,
            MAX_CREATURES_IN_QUEUE: 7,

            //asset constants
            CREATURES_IN_ROW: 18,
            CREATURES_IN_COLUMN: 11,
            TILE_SIZE: 48,
            FONT: 'Arial',

            //time
            BASE_SCANE_TIME: 1000, //ms
            MIN_MOVEMENT_SPEED: 400, //ms per move
            MAX_MOVEMENT_SPEED: 900, //ms per move
            TIME_TO_MAYBE_ADD_NPC_TO_QUEUE: 4000, //ms
            
            //keys
            KEY_A: 65,
            KEY_B: 66,
            KEY_C: 67,
            KEY_D: 68,
            KEY_E: 69,
            KEY_F: 70,
            KEY_G: 71,
            KEY_H: 72,
            KEY_I: 73,
            KEY_J: 74,
            KEY_K: 75,
            KEY_L: 76,
            KEY_M: 77,
            KEY_N: 78,
            KEY_O: 79,
            KEY_P: 80,
            KEY_Q: 81,
            KEY_R: 82,
            KEY_S: 83,
            KEY_T: 84,
            KEY_U: 85,
            KEY_V: 86,
            KEY_W: 87,
            KEY_X: 88,
            KEY_Y: 89,
            KEY_Z: 90,
            KEY_UP: 38,
            KEY_LEFT: 37,
            KEY_RIGHT: 39,
            KEY_DOWN: 40,
            KEY_SPACE: 32,
            KEY_LCTRL: 17,
            KEY_LEFT: 37,
            KEY_UP: 38,
            KEY_RIGHT: 39,
            KEY_DOWN: 40,
        };
    });
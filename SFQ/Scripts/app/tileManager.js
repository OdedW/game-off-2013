define('tileManager',
    ['createjs', 'assetManager', 'constants'], function (createjs, assetManager, constants) {
       // var 
            //stage,
            //world,
            //collidables,
            //spriteSheet,
            //backgroundShiftHorizontal = 12,
            //backgroundShiftVertical = 5,
            //backgroundBaseX = -20,
            //backgroundBaseY = -20,
            //background,
            
            //init = function (myStage, myWorld, myCollidables) {
            //    stage = myStage;
            //    world = myWorld;
            //    collidables = myCollidables;
                
            //    //background
            //    background = new createjs.Bitmap(assetManager.images['background1']);
            //    background.x = backgroundBaseX;
            //    background.y = backgroundBaseY;
            //    stage.addChild(background);
                
            //    //tiles
            //    var tilemap = window.tilemap;
            //    var data = {
            //        images: [assetManager.images['walkway']],
            //        frames: { width: tilemap.tilesets[0].tilewidth, height: tilemap.tilesets[0].tileheight },
            //        animations: {tile1: [0], tile2:[1],tile3:[2],tile4:[3]}
            //    };
            //    spriteSheet = new createjs.SpriteSheet(data);
               
                
            //    var layer = tilemap.layers[0];
            //    var paddingTop = tilemap.tileheight - tilemap.tilesets[0].tileheight;
                
            //    for (var j = 0; j < layer.height; j++) {
            //        for (var i = 0; i < layer.width; i++) {
            //            var index = j * layer.width + i;
            //            if (layer.data[index] != 0)
            //                addPlatform(layer.data[index], i * tilemap.tilewidth, j * tilemap.tileheight + paddingTop);
            //        }
            //    }
            //},
            
            //addPlatform = function (tile, x, y) {
            //    x = Math.round(x);
            //    y = Math.round(y);
            //    var platform = new createjs.Sprite(spriteSheet, 'tile' + tile);
            //    platform.x = x;
            //    platform.y = y;
            //    platform.snapToPixel = true;

            //    world.addChild(platform);
            //    collidables.push(platform);
            //},
            //tick = function (hero) {
            //    var x = -((hero.view.x / constants.WORLD_WIDTH) * backgroundShiftHorizontal - (backgroundShiftHorizontal / 2));
            //    var y = -((hero.view.y / constants.WORLD_HEIGHT) * backgroundShiftVertical - (backgroundShiftVertical / 2));
            //    background.x = backgroundBaseX + x;
            //    background.y = backgroundBaseY + y;
            //};

        return {
            //init: init,
            //tick:tick
        };
    });
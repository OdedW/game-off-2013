define('tileManager',
    ['createjs', 'assetManager', 'constants'], function (createjs, assetManager, constants) {
        var
            collisionLayer,
            init = function () {
                for (var j = 0; j < constants.NUM_ROWS; j++) {
                    var arr = [];
                    for (var i = 0; i < constants.NUM_COLUMNS; i++) {
                        arr.push(false);
                    }
                    collisionMap.push(arr);
                }

                var tilemap = window.tilemap;
                
                for (var i = 0; i < tilemap.layers.length; i++) {
                    if (tilemap.layers[i].name == "Collision") {
                        collisionLayer = tilemap.layers[i];
                        break;
                    }
                }

                clearCollisionMap();
            },
            collisionMap = [],
            clearCollisionMap = function(){
                for (var j = 0; j < constants.NUM_ROWS; j++) {
                    for (var i = 0; i < constants.NUM_COLUMNS; i++) {
                        var index = j * constants.NUM_COLUMNS + i;
                        collisionMap[j][i] = collisionLayer.data[index] == 1;
                    }
                }
            };

        init();

        return {
            collisionMap: collisionMap,
            clearCollisionMap:clearCollisionMap
        };
    });
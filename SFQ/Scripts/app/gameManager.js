define('gameManager',
    ['createjs', 'assetManager', 'CreatureEntity', 'constants', 'Queue'],
    function (createjs, assetManager, CreatureEntity, constants, Queue) {
        var stage,
            canvasWidth,
            canvasHeight,
            world,
            queues = [],
            fpsLabel, progressLabel,
            init = function() {
                //create stage
                canvasWidth = $('#game-canvas').width();
                canvasHeight = $('#game-canvas').height();
                stage = new createjs.Stage("game-canvas");
                stage.enableMouseOver(10);
                world = new createjs.Container();
                
                //fps
                fpsLabel = new createjs.Text('0', '15px Arial', '#fff');
                fpsLabel.x = 5;
                fpsLabel.y = 5;
                
                progressLabel = new createjs.Text('0', '8px', '#111');
                progressLabel.x = canvasWidth - 30;
                progressLabel.y = 0;
                progressLabel.text = '0%';
                stage.addChild(progressLabel);

                //load assets
                assetManager.loadAssets();
                assetManager.progressChangedEvent.add(function(progress) {
                    progressLabel.text = Math.floor(progress * 100) + '%';
                    if (progress >= 1) {
                        stage.removeChild(progressLabel);
                    }
                });
                assetManager.loadCompleteEvent.add(initializeGraphics);
                
              
            },
            initializeGraphics = function () {
                //tileManager.init(stage, world, collidables);
                var bg = new createjs.Bitmap(assetManager.images['bg']);
                stage.addChild(bg);

                createQueue(3, 2, 8, 5);
                createQueue(5, 2, 8, 5);
                createQueue(7, 2, 8, 5);
                stage.addChild(world);
                //stage.addChild(fpsLabel);
                
                setupKeys();
                
                createjs.Ticker.requestRAF = true;
                createjs.Ticker.setFPS(constants.FPS);
                createjs.Ticker.addEventListener("tick", tick);
            },
            createQueue = function (row, col, min, max) {
                var queue = new Queue(row, col, min, max);
                var views = queue.getViews();
                for (var i = 0; i < views.length; i++) {
                    world.addChild(views[i]);
                }
                queues.push(queue);
            },
            //Key handling
            setupKeys = function(){
                document.onkeydown = handleKeyDown;
                document.onkeyup = handleKeyUp;
//                document.onmousedown = handleKeyDown;
//                document.onmouseup = handleKeyUp;
            },
            keysDown = {},
            handleKeyDown = function (e) {
                if (!keysDown[e.keyCode]) {
                    keysDown[e.keyCode] = true;

                    if (e.keyCode == constants.KEY_S) {
                        for (var i = 0; i < queues.length; i++) {
                            for (var j = 0; j < queues[i].npcs.length; j++) {
                                queues[i].npcs[j].toggleItemCountLabel();
                            }
                        }
                    }
                    
                }
            },
            handleKeyUp = function (e) {
                keysDown[e.keyCode] = false;
                
            },
            
            //Tick
            tick = function (evt) {
                fpsLabel.text = evt.currentTarget.getFPS().toFixed(2);
                //tileManager.tick(hero);
                stage.update();
            };
        

        return {
            init: init
        };
    });
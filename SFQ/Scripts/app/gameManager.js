define('gameManager',
    ['createjs', 'assetManager', 'CreatureEntity', 'constants', 'Queue', 'tileManager', 'PlayerEntity'],
    function (createjs, assetManager, CreatureEntity, constants, Queue, tileManager, PlayerEntity) {
        var stage,
            canvasWidth,
            canvasHeight,
            world,
            queues = [],
            paused = false,
            player,
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
                var bg = new createjs.Bitmap(assetManager.images.bg);
                world.addChild(bg);

                createQueue(2, 2, 8, 5, 3, 4);
                createQueue(5, 2, 8, 5, 5, 5);
                createQueue(8, 2, 8, 5, 9, 6);
                player = new PlayerEntity(1, 0);
                world.addChild(player.view);
                stage.addChild(world);
                //stage.addChild(fpsLabel);

                //assetManager.playSound('supermarket', 0.08, true);
                //assetManager.playSound('bossa', 1, true);

                setupKeys();
                
                createjs.Ticker.requestRAF = true;
                createjs.Ticker.setFPS(constants.FPS);
                createjs.Ticker.addEventListener("tick", tick);

            },
            createQueue = function (row, col, min, max, entry, exit) {
                var queue = new Queue(row, col, min, max, entry, exit);
                var views = queue.getViews();
                for (var i = 0; i < views.length; i++) {
                    world.addChild(views[i]);
                }
                queue.viewAdded.add(function (view) {
                    world.removeChild(player.view); //player is always on top
                    world.addChild(view);
                    world.addChild(player.view);

                });
                queue.viewRemoved.add(function (view) {
                    world.removeChild(view);
                });
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

                    //movement
                    if (e.keyCode === constants.KEY_S || e.keyCode === constants.KEY_DOWN) {
                        player.move(0, 1);
                    }
                    else if (e.keyCode === constants.KEY_A || e.keyCode === constants.KEY_LEFT) {
                        player.move(-1, 0);
                    }
                    else if (e.keyCode === constants.KEY_W || e.keyCode === constants.KEY_UP) {
                        player.move(0, -1);
                    }
                    else if (e.keyCode === constants.KEY_D || e.keyCode === constants.KEY_RIGHT) {
                        player.move(1, 0);
                    }
                    else if (e.keyCode === constants.KEY_SPACE) {
                        for (var i = 0; i < queues.length; i++) {
                            queues[0].allNpcs[0].say('You made a mistake there');
                        }
                    }

                    else if (e.keyCode === constants.KEY_P) {
                        togglePause();
                    }

                    else if (e.keyCode === constants.KEY_M) {
                        assetManager.toggleMute();
                    }
                    else {
                        console.log(e.keyCode);
                    }
                    
                }
            },
            handleKeyUp = function (e) {
                keysDown[e.keyCode] = false;
                
            },
            
            //Tick
            tick = function (evt) {
                fpsLabel.text = evt.currentTarget.getFPS().toFixed(2);
                if (!paused) {
                    for (var i = 0; i < queues.length; i++) {
                        queues[i].tick(evt);
                    }
                }
                stage.update();
            },
            togglePause = function () {
                paused = !paused;
                createjs.Tween.get(world).to({ alpha: paused ? 0.4 : 1 }, 200, createjs.Ease.quadIn);
            };
        

        return {
            init: init
        };
    });
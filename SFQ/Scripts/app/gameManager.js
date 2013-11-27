define('gameManager',
    ['createjs', 'assetManager', 'CreatureEntity', 'constants', 'Queue', 'tileManager', 'screenManager'],
    function (createjs, assetManager, CreatureEntity, constants, Queue, tileManager, screenManager) {
        var stage,
            canvasWidth,
            canvasHeight,
            progressLabel,
            init = function() {
                //create stage
                canvasWidth = $('#game-canvas').width();
                canvasHeight = $('#game-canvas').height();
                stage = new createjs.Stage("game-canvas");
                stage.enableMouseOver(10);

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
//                    console.log(progressLabel.text);

                });
                assetManager.loadCompleteEvent.add(initializeGraphics);


                //temp
                //assetManager.toggleMute();

            },
            initializeGraphics = function() {
                screenManager.init();
                for (var i = 0; i < screenManager.screens.length; i++) {
                    stage.addChild(screenManager.screens[i].mainView);
                }

                //assetManager.playSound('supermarket', 0.08, true);
                //assetManager.playSound('bossa', 1, true);

                setupKeys();

                screenManager.getCurrentScreen().show();
                createjs.Ticker.requestRAF = true;
                createjs.Ticker.setFPS(constants.FPS);
                createjs.Ticker.addEventListener("tick", tick);

            },
            //Key handling
            setupKeys = function() {
                document.onkeydown = handleKeyDown;
                document.onkeyup = handleKeyUp;
//                document.onmousedown = handleKeyDown;
//                document.onmouseup = handleKeyUp;
            },
            keysDown = {},
            handleKeyDown = function(e) {
                if (!keysDown[e.keyCode]) {
                    keysDown[e.keyCode] = true;

                    screenManager.getCurrentScreen().handleKeyDown(e);

                    if (e.keyCode === constants.KEY_M) {
                        assetManager.toggleMute();
                    }

                }
            },
            handleKeyUp = function(e) {
                keysDown[e.keyCode] = false;

                screenManager.getCurrentScreen().handleKeyUp(e);
            },            
            //Tick
            tick = function(evt) {
                screenManager.getCurrentScreen().tick(evt);
                stage.update();
            };
            
        

        return {
            init: init
        };
    });
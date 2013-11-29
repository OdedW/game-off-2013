define('gameManager',
    ['createjs', 'assetManager', 'CreatureEntity', 'constants', 'Queue', 'tileManager', 'screenManager'],
    function (createjs, assetManager, CreatureEntity, constants, Queue, tileManager, screenManager) {
        var stage,
            canvasWidth,
            canvasHeight,
            muted, unmuted,
            init = function() {
                //create stage
                canvasWidth = $('#game-canvas').width();
                canvasHeight = $('#game-canvas').height();
                stage = new createjs.Stage("game-canvas");
                stage.enableMouseOver(10);

                createjs.Ticker.requestRAF = true;
                createjs.Ticker.setFPS(constants.FPS);
                createjs.Ticker.addEventListener("tick", tick);
                
                screenManager.loadSplash(function () {
                    initializeGraphics();
                });

                stage.addChild(screenManager.splashScreen().mainView);
            },
            initializeGraphics = function () {
//                assetManager.toggleMute();

                screenManager.init();
                for (var i = 0; i < screenManager.screens.length; i++) {
                    stage.addChild(screenManager.screens[i].mainView);
                }

                muted = new createjs.Bitmap(assetManager.images.muted);
                muted.x = 20;muted.y = constants.WORLD_HEIGHT - 38;muted.scaleX = muted.scaleY = 0.5; muted.alpha = 0;
                unmuted = new createjs.Bitmap(assetManager.images.unmuted);
                unmuted.x = 20; unmuted.y = constants.WORLD_HEIGHT - 38; unmuted.scaleX = unmuted.scaleY = 0.5; unmuted.alpha = 0;
                stage.addChild(muted, unmuted);
                setupKeys();
                screenManager.getCurrentScreen().activate();
                screenManager.getCurrentScreen().show();
                

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
                        var icon = assetManager.isMuted() ? unmuted : muted;
                        createjs.Tween.get(icon).to({ alpha: 1 }, 200, createjs.Ease.quadIn);
                        setTimeout(function() {
                            createjs.Tween.get(icon).to({ alpha: 0 }, 400, createjs.Ease.quadIn);
                        },1000);
                        assetManager.toggleMute();
                    }

                }
            },
            handleKeyUp = function(e) {
                keysDown[e.keyCode] = false;

                screenManager.getCurrentScreen().handleKeyUp(e);
            },            
            //Tick
            tick = function (evt) {
                if (screenManager.getCurrentScreen())
                    screenManager.getCurrentScreen().tick(evt);
                stage.update();
            };
            
        

        return {
            init: init
        };
    });
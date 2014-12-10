///#source 1 1 /Scripts/app/analytics.js
define('analytics',
    [], function() {
        var
            identify = function () {

            },
            track = function(eventName, extraData) {
                                mixpanel.track(eventName, extraData);
//                console.log('track: '+eventName);
                
            };

        return {
            identify: identify,
            track:track
        };
    });
///#source 1 1 /Scripts/app/assetManager.js
define('assetManager',
    ['createjs'], function (createjs) {
        var images = {},
            queue,
            progressChangedEvent = $.Callbacks(),
            loadCompleteEvent = $.Callbacks(),
            manifest = [
                //images
                { src: "./Content/Images/oryx_creatures.png", id: "creatures" },
                { src: "./Content/Images/bg.png", id: "bg" },
                { src: "./Content/Images/table.png", id: "table" },
                { src: "./Content/Images/cashier.png", id: "cashier" },
                { src: "./Content/Images/oryx_items.png", id: "items" },
                { src: "./Content/Images/heart.png", id: "heart" },
                { src: "./Content/Images/bag.png", id: "bag" },
                { src: "./Content/Images/robber.png", id: "robber" },
                { src: "./Content/Images/robberHeart.png", id: "robberHeart" },
                { src: "./Content/Images/logo.png", id: "logo" },
                { src: "./Content/Images/muted.png", id: "muted" },
                { src: "./Content/Images/unmuted.png", id: "unmuted" },
                { src: "./Content/Images/cash_register.png", id: "cashRegister" },


                //sounds
                { src: "./Content/Sounds/walk.mp3|./Content/Sounds/walk.ogg", id: 'walk' },
                { src: "./Content/Sounds/bump.mp3|./Content/Sounds/bump.ogg", id: 'bump' },
                { src: "./Content/Sounds/thud.mp3|./Content/Sounds/thud.ogg", id: 'thud' },
                { src: "./Content/Sounds/beep.mp3|./Content/Sounds/beep.ogg", id: 'beep' },
                { src: "./Content/Sounds/bossa.mp3|./Content/Sounds/bossa.ogg", id: 'bossa' },
                { src: "./Content/Sounds/action.mp3|./Content/Sounds/action.ogg", id: 'action' },
                { src: "./Content/Sounds/win.mp3|./Content/Sounds/win.ogg", id: 'win' },
            ],
            loadAssets = function () {
                queue = new createjs.LoadQueue();
                queue.installPlugin(createjs.Sound);
                queue.addEventListener("complete", handleComplete);
                queue.addEventListener("fileload", handleFileLoad);
                queue.addEventListener("progress", handleProgress);
                queue.loadManifest(manifest);
            },
            handleFileLoad = function (o) {
                //You could store all your images in object to call them easily.  
                if (o.item.type === "image") {
                    images[o.item.id] = o.result;

                }
            },
            handleProgress = function (event) {
                progressChangedEvent.fireWith(window, [event.progress]);
            },
            handleComplete = function (event) {
                loadCompleteEvent.fire();
            },

        //sound stuff
            currentMusic,

        isMuted = false,
            playSound = function (id, volume, loop) {
                volume = volume || 1;
                var sound = createjs.Sound.play(id, createjs.Sound.INTERRUPT_NONE, 0, 0, loop ? -1 : 0, volume);
                return sound;
            },
            stopMusic = function (callback) {
                createjs.Tween.get(currentMusic).to({ volume: 0 }, 800, createjs.Ease.quadIn).call(function () {
                    currentMusic.stop();
                    if (callback)
                        callback();
                });
            },
            playMusic = function (id, volume) {
                if (currentMusic) {
                    if (currentMusic.id !== id) {
                        stopMusic(function () {
                            currentMusic = playSound(id, volume, true);
                            currentMusic.id = id;
                        });
                    }
                } else {
                    currentMusic = playSound(id, volume, true);
                    currentMusic.id = id;

                }

            },
            toggleMute = function () {
                isMuted = !isMuted;
                createjs.Sound.setMute(isMuted);
            };

        return {
            loadAssets: loadAssets,
            progressChangedEvent: progressChangedEvent,
            loadCompleteEvent: loadCompleteEvent,
            images: images,
            playSound: playSound,
            toggleMute: toggleMute,
            playMusic: playMusic,
            stopMusic: stopMusic,
            isMuted: function () { return isMuted; }
        };
    });
///#source 1 1 /Scripts/app/BaseEntity.js
define('BaseEntity',
    ['createjs'], function (createjs) {
        return Class.extend({
            init: function (x, y) {
                this.setSize();
                this.createSpriteSheet();
                this.createView(x, y);
            },
            createSpriteSheet:function(){

            },
            createView:function(){

            },
            setSize:function(){
                this.size = { w: 0, h: 0 };
            },
            getBounds:function(){
                return { x: this.view.x, y: this.view.y, width: this.size.w, height: this.size.h };
            }
        })
    });
///#source 1 1 /Scripts/app/bootstrapper.js
define('bootstrapper',
    ['gameManager', 'analytics'],
    function (gameManager, analytics) {
        var run = function () {
            analytics.track('Page View');
            Math.sign = function (number) { return number ? number < 0 ? -1 : 1 : 0; };
            startApp();
        },
            startApp = function () {
                gameManager.init();
            };

        return {
            run: run,
        };
    });

(function (d) {
    var root = this;

    require.config({
        baseUrl: "/Scripts/app"
    });
    define3rdPartyModules();
    loadPluginsAndBoot();

    function define3rdPartyModules() {
        // These are already loaded via bundles. 
        // We define them and put them in the root object.
        //        define('jquery', [], function () { return root.jQuery; });
        //        define('ko', [], function () { return root.ko; });
        define('createjs', [], function () { return root.createjs; });
    }

    function loadPluginsAndBoot() {
        // Plugins must be loaded after jQuery and Knockout, 
        // since they depend on them.
        requirejs([
                //'ko.bindingHandlers',
                //'ko.debug.helpers',
                //'ko.extenders'
        ], boot);
    }

    function boot() {
        require(['bootstrapper'], function (bs) { bs.run(d); });
    }
})(document);
///#source 1 1 /Scripts/app/CashierEntity.js
define('CashierEntity',
    ['createjs', 'CreatureEntity', 'text', 'constants', 'assetManager', 'NpcEntity'], function (createjs, CreatureEntity, text, constants, assetManager, NpcEntity) {
        return NpcEntity.extend({
            init: function (row, col) {
                this.name = text.getCashierName(9);
                this.score = Math.round(Math.random() * 2 + 14);
                this.accuracy = Math.round(Math.random() * 5 + 5);
                this.speed = this.score - this.accuracy;
                this.timeToScan = constants.BASE_SCANE_TIME * (1 + (10 - this.speed) / 10);
                this._super(row, col);
            },
            createSpriteSheet: function () {
                var animationSpeed = Math.random() * 0.04 + 0.06;
                var data = {
                    images: [assetManager.images.cashier],
                    frames: { width: this.size.w, height: this.size.h },
                    animations: {
                        idle: { frames: [0, 1], speed: animationSpeed }
                    }
                };
                this.spriteSheet = new createjs.SpriteSheet(data);
            },
            showDescription: function () {
                if (this.description.alpha === 0)
                    createjs.Tween.get(this.description).to({ alpha: 1 }, 100, createjs.Ease.quadIn);
            },
            hideDescription: function () {
                if (this.description.alpha === 1)
                    createjs.Tween.get(this.description).to({ alpha: 0 }, 100, createjs.Ease.quadIn);
            },
            toggleDescription: function () {
                if (this.description.alpha === 1)
                    this.hideDescription();
                else if (this.description.alpha === 0)
                    this.showDescription();
            },
            createView: function (x, y) {
                this._super(x, y);

                this.description = new createjs.Container();
                this.description.x = this.size.w + 5;
                this.description.y = 5;
                this.description.alpha = 0;
                var rect = new createjs.Shape();
                rect.graphics.beginFill("gray").drawRoundRect(0, 0, constants.TILE_SIZE * 1.75, constants.TILE_SIZE * 1.75, 5)
                .beginFill("black").drawRoundRect(2, 2, constants.TILE_SIZE * 1.75 - 4, constants.TILE_SIZE * 1.75 - 4, 5);
                rect.alpha = 0.8;

                var nameLabel = new createjs.Text(this.name, "10px " + constants.FONT + " ", "white");
                nameLabel.x = 6;
                nameLabel.y = 6;

                var speedLabel = new createjs.Text('Speed: ' + this.speed, "9px " + constants.FONT, "white");
                speedLabel.x = 6;
                speedLabel.y = 30;

                var accuracyLabel = new createjs.Text('Accuracy: ' + this.accuracy, "9px " + constants.FONT, "white");
                accuracyLabel.x = 6;
                accuracyLabel.y = 54;

                this.description.addChild(rect, nameLabel, accuracyLabel, speedLabel);

                var that = this;
                this.avatar.addEventListener("mouseover", function () {
                    that.showDescription();
                });
                this.avatar.addEventListener("mouseout", function () {
                    that.hideDescription();
                });

                this.view.addChild(this.description);
                this.view.mouseEnabled = true;

                this.itemCountLabel.alpha = 0;
            },            
        });
    });
///#source 1 1 /Scripts/app/constants.js
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
            CHANCE_OF_BEING_AGRESSIVE: 1,
            NUM_OF_WARNINGS_BEFORE_ENGAGING: 1,
            ENTRY_ROWS: [1, 3, 5, 7, 9],
            CORNERS: [{ row: 1, col: 13 }, { row: 9, col: 13 }, { row: 1, col: 0 }, { row: 9, col: 0 }],
            
            //asset constants
            CREATURES_IN_ROW: 18,
            CREATURES_IN_COLUMN: 11,
            TILE_SIZE: 48,
            FONT: 'Minecraftia',

            //time
            BASE_SCANE_TIME: 800, //ms
            MIN_MOVEMENT_SPEED: 400, //ms per move
            MAX_MOVEMENT_SPEED: 900, //ms per move
            TIME_TO_MAYBE_ADD_NPC_TO_QUEUE: 4000, //ms
            TIME_BETWEEN_CALLS_TO_MOVE_UP: 5000,
            TIME_BETWEEN_WARNINGS: 2200,
            
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
            KEY_ENTER: 13,
            KEY_ESC:27
        };
    });
///#source 1 1 /Scripts/app/CopEntity.js
define('CopEntity',
    ['createjs','NpcEntity','tileManager','assetManager'], function (createjs,NpcEntity,tileManager,assetManager) {
        return NpcEntity.extend({
            init: function (row, col, player, saySomething) {
                var that = this;
                this._super(row, col, 36);
                this.itemCountLabel.alpha = 0;
                this.killMode = true;
                this.shouldMove = true;
                this.isCop = true;
                this.movementDestination = { row: player.row, col: player.col };
                if (saySomething)
                    this.say('Stop in the name of the law!');
                player.moved.add(function() {
                    that.movementDestination = { row: player.row, col: player.col };
                });
                this.hitPoints = 3;
            }
        });
    });
///#source 1 1 /Scripts/app/CreatureEntity.js
define('CreatureEntity',
    ['createjs', 'assetManager', 'BaseEntity', 'utils', 'constants', 'tileManager'],
    function (createjs, assetManager, BaseEntity, utils, constants, tileManager) {
        return BaseEntity.extend({
            init: function (row, col, index) {
                this.setItemCount();
                var creatureIndex = this.getRandomCreatureIndex();
                this.creatureIndex = index === undefined ? creatureIndex : index;
                var pos = utils.getAbsolutePositionByGridPosition(row, col);
                this.row = row;
                this.col = col;
                this.hitPoints = 3;
                this.isDead = false;

                this._super(pos.x, pos.y);
                tileManager.collisionMap[this.row][this.col] = this;
                
                //callbacks
                this.moved = $.Callbacks();
                this.tookHit = $.Callbacks();
                this.died = $.Callbacks();
                this.sayingSomething = $.Callbacks();

            },
            getRandomCreatureIndex:function() {
                var index = 0;
                do {
                    var creatureRow = Math.floor(Math.random() * constants.CREATURES_IN_COLUMN);
                    var creatureColumn = Math.floor(Math.random() * constants.CREATURES_IN_ROW);
                    index = creatureRow * constants.CREATURES_IN_ROW * 2 + creatureColumn;
                } while (index === 0 || index === 36 || index === 86 || index === 124); //don't pick hero, cashier, cop or robber
                return index;
            },
            hit: function () {
                this.hitPoints--;
                this.tookHit.fire();
            },
            setItemCount:function() {
                this.initialItemCount = this.itemCount = 0;
            },
            setSize: function () {
                this.size = { w: 48, h: 48 };
            },
            createSpriteSheet: function () {
                var animationSpeed = Math.random() * 0.04 + 0.06;
                var data = {
                    images: [assetManager.images.creatures],
                    frames: { width: this.size.w, height: this.size.h },
                    animations: {
                        idle: { frames: [this.creatureIndex, this.creatureIndex + constants.CREATURES_IN_ROW], speed: animationSpeed },
                        scared: { frames: [this.creatureIndex, this.creatureIndex + constants.CREATURES_IN_ROW], speed: 0.3 },
                        still: { frames: [this.creatureIndex], speed: 0.3 }
                        
                    }
                };
                this.spriteSheet = new createjs.SpriteSheet(data);
            },
            createView: function (x, y) {
                this.view = new createjs.Container();
                
                //speech bubble
                this.createSpeechBubble(constants.TILE_SIZE * 1.5, constants.TILE_SIZE, -constants.TILE_SIZE / 2, '10px', 12);
                
                this.avatar = new createjs.Sprite(this.spriteSheet, 'idle');
                this.avatar.regX = this.avatar.regY = this.size.w / 2;
                this.avatar.x = this.avatar.y = this.size.w / 2;
                this.view.addChild(this.avatar);
                this.view.x = x ;
                this.view.y = y;
                
                this.itemCountLabel = new createjs.Container();
                this.itemCountLabel.x = this.size.w - 5;
                this.itemCountLabel.y = this.size.h - 5;
                // this.itemCountLabel.alpha = 0;
                var circle = new createjs.Shape();
                circle.graphics.beginFill("gray").drawCircle(0, 0, 11).beginFill("black").drawCircle(0, 0, 9);
                circle.alpha = 0.7;

                this.itemCountText = new createjs.Text(this.itemCount.toString(), "14px Arial", "white");
                this.itemCountText.x = -4;
                this.itemCountText.y = -8;
                this.firstInLine = false;
                this.itemCountLabel.addChild(circle, this.itemCountText);
                this.view.addChild(this.itemCountLabel);
            },
            createSpeechBubble: function (width, height, x, fontSize, lineHeight) {
                if (this.speechBubble) {
                    this.view.removeChild(this.speechBubble);
                }
                this.speechBubbleText = new createjs.Text(this.name, fontSize + " " + constants.FONT + "", "white");
                this.speechBubbleText.lineWidth = width - 10;
                this.speechBubbleText.x = 6;
                this.speechBubbleText.y = 2;
                this.speechBubbleText.lineHeight = lineHeight;
                this.speechBubbleWidth = width;
                this.speechBubble = new createjs.Container();
                this.speechBubbleContainer = new createjs.Shape();
                this.drawBubbleAndSetY(width, height);
                this.speechBubble.alpha = 0;
                this.speechBubble.x = x;
                
                this.speechBubble.addChild(this.speechBubbleContainer, this.speechBubbleText);
                this.view.addChild(this.speechBubble);
            },
            drawBubbleAndSetY: function () {
                var height = this.speechBubbleText.getMeasuredHeight() + 10;
                this.speechBubbleContainer.graphics.clear().beginFill("gray").drawRoundRect(0, 0, this.speechBubbleWidth, height, 5)
                   .beginFill("black").drawRoundRect(2, 2, this.speechBubbleWidth - 4, height - 4, 5);
                this.speechBubble.y = -height;

            },
            tick: function(evt) {
            },
            setPosition: function (row, col) {
                //set position in collisionMap
                tileManager.collisionMap[this.row][this.col] = false;
                tileManager.collisionMap[row][col] = this;
//                if (this.isPlayer)
//                console.log('went from '+this.row+','+this.col+' to '+row+','+col);
                
                this.row = row;
                this.col = col;

                var pos = utils.getAbsolutePositionByGridPosition(row, col);
                this.view.x = pos.x;
                this.view.y = pos.y;
            },
            say: function (text, timeout, callback, dontReposition) {
                if (this.isDead)
                    return;
                this.speechBubbleText.text = text;
                this.drawBubbleAndSetY();
                if (!dontReposition) {
                    if (tileManager.collisionMap[this.row - 1][this.col] && !tileManager.collisionMap[this.row + 1][this.col]) { //someone is one square up
                        this.speechBubble.y = this.speechBubble.y * -1;
                    } 
                }

                timeout = timeout || 3000;
                var that = this;
                
                createjs.Tween.get(this.speechBubble).to({ alpha: 1 }, 100, createjs.Ease.quadIn).call(function() {
                    if (that.isDead) {
                        createjs.Tween.get(that.speechBubble).to({ alpha: 0 }, 100, createjs.Ease.quadIn);
                    } else {
                        that.sayingSomething.fire(that);
                    }
                });
                
                if (this.speechTimeout) {
                    clearInterval(this.speechTimeout);
                }

                this.dialogCallback = callback;
                this.speechTimeout = setTimeout(function () {
                    that.endDialog.apply(that);
                }, timeout);

            },
            endDialog: function () {
                var that = this;
                var callback = this.dialogCallback;
                that.dialogCallback = null;

                createjs.Tween.get(this.speechBubble).to({ alpha: 0 }, 100, createjs.Ease.quadIn);
                if (callback)
                    setTimeout(function () {
                        callback(that);
                    }, 100);
            },
            stopSayingSomething: function () {
                if (this.speechTimeout) {
                    clearInterval(this.speechTimeout);
                }
                this.endDialog();
            },
            removeItem: function () {
                if (this.itemCount > 0) {
                    this.itemCount--;
                    this.itemCountText.text = this.itemCount;
                }
            },
            showItemCount: function () {
                if (this.itemCountLabel.alpha === 0)
                    createjs.Tween.get(this.itemCountLabel).to({ alpha: 1 }, 100, createjs.Ease.quadIn);
            },
            hideItemCount: function () {
                if (this.itemCountLabel.alpha === 1)
                    createjs.Tween.get(this.itemCountLabel).to({ alpha: 0 }, 200, createjs.Ease.quadIn);
            },
            toggleItemCountLabel: function () {
                if (this.itemCountLabel.alpha === 1)
                    this.hideItemCount();
                else if (this.itemCountLabel.alpha === 0)
                    this.showItemCount();
            },
            die: function (callback) {
                var that = this;
                this.isDead = true;

                createjs.Tween.get(this.avatar).to({ rotation: 720 }, 1000, createjs.Ease.quadOut).call(function() {
//                    that.avatar.rotation = 0;
                });
                createjs.Tween.get(this.avatar).to({ alpha: 0 }, 1000, createjs.Ease.quadIn).call(function () {
//                    that.avatar.alpha = 1;
                });
                createjs.Tween.get(this.avatar).to({ scaleX: 0 }, 1000, createjs.Ease.quadOut).call(function () {
//                    that.avatar.scaleX = 1;
                });
                createjs.Tween.get(this.avatar).to({ scaleY: 0 }, 1000, createjs.Ease.quadOut).call(function () {
//                    that.avatar.scaleY = 1;
                });
                tileManager.collisionMap[that.row][that.col] = false; //remove from board

                setTimeout(function() {
                    that.died.fire(that);
                    if (callback)
                        callback();
                }, 500);
            }
        });
});
///#source 1 1 /Scripts/app/CreditsScreen.js
define('CreditsScreen',
    ['MenuScreen', 'assetManager', 'constants'], function (MenuScreen, assetManager, constants) {
        return MenuScreen.extend({
            init: function () {
                this._super();
                var that = this;
                
                this.title = this.createOutlinedText('All programming and music by Inja Games', 18, 50, 2);
                this.logo = new createjs.Bitmap(assetManager.images.logo);
                this.logo.y = 80;
                this.logo.x = 230;
                this.subItem1 = this.createOutlinedText("• Using the 16-bit set from Oryx Design Labs", 18, 310, 2);
                this.subItem2 = this.createOutlinedText("www.oryxdesignlab.com", 14, 332, 2);
                this.subItem3 = this.createOutlinedText("• Created with CreateJS", 18, 370, 2);

                this.subItem4 = this.createOutlinedText("Subscribe to our twitter feed for more news!", 18, 410, 2);
                this.subItem5 = this.createOutlinedText("twitter.com/InjaGames", 18, 440, 2);
                this.mainView.addChild(this.title, this.logo, this.subItem1, this.subItem2, this.subItem3, this.subItem4, this.subItem5);
                this.setupLink(this.subItem2, 'http://www.oryxdesignlab.com');
                this.setupLink(this.subItem5, 'http://twitter.com/InjaGames');
                this.mainView.addEventListener("click", function (evt) {
                    
                    if (!that.subItem2.hitTest(that.subItem2.globalToLocal(evt.stageX, evt.stageY).x,that.subItem2.globalToLocal(evt.stageX, evt.stageY).y ) && 
                        !that.subItem7.hitTest(that.subItem2.globalToLocal(evt.stageX, evt.stageY).x,that.subItem7.globalToLocal(evt.stageX, evt.stageY).y ))
                        that.goToMainMenuScreen.fire();
                });
            },
            activate:function() {
            },
            handleKeyDown: function (e) {
                this.goToMainMenuScreen.fire();
            },
            setupLink: function (element, url) {
                var elem = element;
                element.addEventListener("mouseover", function (evt) {
                    elem.main.color = 'lightblue';
                });
                element.addEventListener("mouseout", function (evt) {
                    elem.main.color = 'white';
                });
                element.addEventListener("click", function (evt) {
                    window.open(url, '_blank');
                });
            }
        });
    });
///#source 1 1 /Scripts/app/gameManager.js
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
///#source 1 1 /Scripts/app/GameScreen.js
define('GameScreen',
    ['createjs', 'Screen', 'PlayerEntity', 'Queue', 'assetManager', 'constants', 'tileManager', 'CopEntity' , 'utils', 'RobberEntity', 'text', 'analytics'],
    function (createjs, Screen, PlayerEntity, Queue, assetManager, constants, tileManager, CopEntity, utils, RobberEntity, text, analytics) {
        return Screen.extend({

            init: function (level, endGameRetries, afterReset) {
                var that = this;
                this.currentLevel = level || 0;
                analytics.track('Started Level ' + this.currentLevel);
                this.endGameRetries = endGameRetries || 0;
                if (!afterReset) {
                    this._super();
                }
                this.gameWorld = new createjs.Container();
                this.mainView.addChild(this.gameWorld);
                this.isInEndGame = false;

                //win text
                this.endStateText = this.createOutlinedText('', 36, 0, 4);
                this.endStateText.setLineWidth(constants.WORLD_WIDTH - 100);
                this.endStateText.setLineHeight(39);
                this.winStateText = this.createOutlinedText('', 20, 0, 2);
                this.winStateText.setLineHeight(23);
                this.winStateText.setLineWidth(constants.WORLD_WIDTH - 100);
                this.winStateText.alpha = 0;
                this.pressAnyKeyText = this.createOutlinedText('press any key', 12, 0, 2);
                this.endStateContainer = new createjs.Container();
                this.endStateContainer.alpha = 0;
                this.endStateContainer.addChild(this.endStateText,this.winStateText, this.pressAnyKeyText);
                this.mainView.addChild(this.endStateContainer);
              
                //gameWorld
                var bg = new createjs.Bitmap(assetManager.images.bg);
                this.gameWorld.addChild(bg);
                this.setupLevel();
                this.cops = [];
                this.gameWorld.addChild(this.player.view);
                
                //win/lose states
                this.inWinState = false;
                this.inLoseState = false;
                this.player.winState.add(function () {
                    that.inWinState = true;
                    that.showEndState.apply(that, [text.getRandomText(text.checkedOutTexts)]);
                });
                this.player.loseState.add(function (txt) {
                    that.inLoseState = true;
                    that.showEndState.apply(that, [txt]);
                });
                
                //hitpoints
                var x = 10;
                this.hitPointsIcons = [];
                for (var i = 0; i < this.player.hitPoints; i++) {
                    var heart = new createjs.Bitmap(assetManager.images.heart);
                    heart.x = x;
                    heart.y = 6;
                    this.hitPointsIcons.push(heart);
                    this.gameWorld.addChild(heart);
                    x += 36;
                }
                this.player.tookHit.add(function() {
                    that.gameWorld.removeChild(that.hitPointsIcons[that.hitPointsIcons.length - 1]);
                    that.hitPointsIcons.splice(that.hitPointsIcons.length - 1, 1);
                });

                //timer
                this.timeSinceLevelStart = 0;
                this.timeLabel = new createjs.Text('00:00', "25px " + constants.FONT, "#0BF50B");
                this.timeLabel.x = constants.WORLD_WIDTH - 90;
                this.timeLabel.y = -2;
                this.gameWorld.addChild(this.timeLabel);

                //item count
                this.bag = new createjs.Bitmap(assetManager.images.bag);
                this.bag.x = 185;
                this.bag.y = 4;
                
                this.itemCountLabel = new createjs.Text(this.player.itemCount, "25px " + constants.FONT, "white");
                this.itemCountLabel.x = 140;
                this.itemCountLabel.y = 0;
                this.gameWorld.addChild(this.bag, this.itemCountLabel);

                //endgame
                this.setupEndgame();
                this.isInEndgameCutscene = false;
                this.npcInDialog = null;
                
                //pause
                this.paused = false;
                this.pauseMenu = new createjs.Container();
                this.pauseMenu.setBounds(0, 0, constants.WORLD_WIDTH, constants.WORLD_HEIGHT);
                this.levelTitle = this.createOutlinedText('Level ' + (this.currentLevel + 1), 30,100, 3);
                var backToGame = this.createOutlinedText('Continue shopping', 18, 210, 2, this.highlightedColor);
                var resetCampaign = this.createOutlinedText('Reset Campaign', 18, 250, 2);
                var backToMenu = this.createOutlinedText('Back to main menu', 18, 290, 2);
                this.pauseMenu.addChild(this.levelTitle, backToGame, resetCampaign, backToMenu);
                this.pauseMenu.alpha = 0;
                this.pauseMenuSelectedItem = 1;
                this.mainView.addChild(this.pauseMenu);
                backToGame.addEventListener("mouseover", function (evt) {
                    for (var j = 1; j < that.pauseMenu.children.length; j++) {
                        that.pauseMenu.children[j].main.color = that.pauseMenu.children[j] === backToGame ? that.highlightedColor : that.unHighlightedColor;
                    }
                    that.currentHighlightedItem = 0;
                });
                backToGame.addEventListener("click", function (evt) {
                    that.togglePause();
                });
                resetCampaign.addEventListener("mouseover", function (evt) {
                    for (var j = 1; j < that.pauseMenu.children.length; j++) {
                        that.pauseMenu.children[j].main.color = that.pauseMenu.children[j] === resetCampaign ? that.highlightedColor : that.unHighlightedColor;
                    }
                    that.currentHighlightedItem = 0;
                });
                resetCampaign.addEventListener("click", function (evt) {
                    that.reset(true);
                });
                backToMenu.addEventListener("mouseover", function (evt) {
                    for (var j = 1; j < that.pauseMenu.children.length; j++) {
                        that.pauseMenu.children[j].main.color = that.pauseMenu.children[j] === backToMenu ? that.highlightedColor : that.unHighlightedColor;
                    }
                    that.currentHighlightedItem = 0;
                });
                backToMenu.addEventListener("click", function (evt) {
                    that.goToMainMenuScreen.fire();
                    setTimeout(function () {
                        that.pauseMenu.alpha = 0;
                        that.gameWorld.alpha = 1;
                    }, 500);
                });
            },
            togglePause:function() {
                this.paused = !this.paused;
                createjs.Tween.get(this.gameWorld).to({ alpha: this.paused ? 0.2 : 1 }, 200, createjs.Ease.quadIn);
                createjs.Tween.get(this.pauseMenu).to({ alpha: this.paused ? 1 : 0 }, 200, createjs.Ease.quadIn);
            },
            setupLevel: function () {
                var that = this;
                var currentLevel = window.levels[this.currentLevel];
                this.player = new PlayerEntity(currentLevel.entryRow, 0);
                this.currentLevelTimes = currentLevel.times;
                this.player.itemCount = currentLevel.itemCount;
                this.queues = [];
                for (var i = 0; i < currentLevel.queues.length; i++) {
                    this.createQueue(currentLevel.queues[i]);
                }

                if (this.currentLevel === window.levels.length - 1){ //last level, trigger end game
                    this.player.moved.add(function triggerEndGame() {
                        if (that.player.col === 3) {
                            that.player.moved.remove(triggerEndGame);
                            that.activateEndGame();
                        }
                    });
                }
            }, createQueue: function (args) {
                var queue = new Queue(this.player, args[0], args[1], args[2], args[3], args[4], args[5]);
                var views = queue.getViews();
                for (var i = 0; i < views.length; i++) {
                    this.gameWorld.addChild(views[i]);
                }
                var that = this;
                queue.viewAdded.add(function (view) {
                    that.gameWorld.removeChild(that.player.view); //player is always on top
                    that.gameWorld.addChild(view);
                    that.gameWorld.addChild(that.player.view);

                });
                queue.viewRemoved.add(function (view) {
                    that.gameWorld.removeChild(view);
                });

                queue.npcDied.add(function () {                    
                    var cop1 = new CopEntity(args[5], constants.NUM_COLUMNS - 1, that.player, that.cops.length == 0);
                    that.cops.push(cop1);
                    var cop2 = new CopEntity(args[4], 0, that.player, that.cops.length == 0);
                    that.cops.push(cop2);
                    that.gameWorld.addChild(cop1.view, cop2.view);
                });
                this.queues.push(queue);
            },
            showEndState:function(txt) {
                this.endStateText.setText(txt);
                var h = this.endStateText.main.getMeasuredHeight();
                this.endStateText.y = constants.WORLD_HEIGHT / 2 - h * 2 / 3;
                if (this.inWinState) {
                    this.winStateText.alpha = 1;
                    this.winStateText.y = this.endStateText.y + h + 10;
                    this.winStateText.setText(this.getWinStateText());
                    this.pressAnyKeyText.y = this.winStateText.y + this.winStateText.main.getMeasuredHeight() + 20;

                } else {
                    this.winStateText.alpha = 0;
                    this.pressAnyKeyText.y = this.endStateText.y + h + 20;
                }
                createjs.Tween.get(this.gameWorld).to({ alpha: 0.2 }, 200, createjs.Ease.quadIn);
                createjs.Tween.get(this.endStateContainer).to({ alpha: 1 }, 200, createjs.Ease.quadIn);
            },
            getWinStateText:function() {
                var time = this.timeSinceLevelStart;
                var txt = 'You checked out in ' + utils.getTimespanInText(time) + '! ';
                if (time/1000 < this.currentLevelTimes[0]) 
                    txt += text.getRandomText(text.checkedOutFastTexts);
                else if (time / 1000 < this.currentLevelTimes[1])
                    txt += text.getRandomText(text.checkedOutMiddleTexts);
                else
                    txt += text.getRandomText(text.checkedOutSlowTexts);
                return txt;

            },
            handleKeyDown: function (e) {
                var that = this;
//                if (e.keyCode == constants.KEY_E)
//                    this.activateEndGame();
                if (e.keyCode === constants.KEY_SPACE || e.keyCode === constants.KEY_ENTER) {
                    if (this.npcInDialog)
                        this.npcInDialog.stopSayingSomething();
                }
                
                if (e.keyCode === constants.KEY_P || e.keyCode === constants.KEY_ESC) {
                    this.togglePause();
                }

                if (this.inWinState || this.inLoseState) {
                    this.currentLevel += this.inWinState ? 1 : 0;
                    this.reset();
                }

                

                if (this.paused) {
                    if (e.keyCode === constants.KEY_S || e.keyCode === constants.KEY_DOWN) {
                        for (var i = 1; i < this.pauseMenu.children.length; i++) {
                            this.pauseMenu.children[i].main.color = this.unHighlightedColor;
                        }
                        this.pauseMenuSelectedItem++;
                        if (this.pauseMenuSelectedItem == this.pauseMenu.children.length) this.pauseMenuSelectedItem = 1;
                        this.pauseMenu.children[this.pauseMenuSelectedItem].main.color = this.highlightedColor;
                    } else if(e.keyCode === constants.KEY_W || e.keyCode === constants.KEY_UP) {
                        for (var i = 1; i < this.pauseMenu.children.length; i++) {
                            this.pauseMenu.children[i].main.color = this.unHighlightedColor;
                        }
                        this.pauseMenuSelectedItem--;
                        if (this.pauseMenuSelectedItem == 0) this.pauseMenuSelectedItem = this.pauseMenu.children.length-1;
                        this.pauseMenu.children[this.pauseMenuSelectedItem].main.color = this.highlightedColor;
                    }
                    if (e.keyCode === constants.KEY_SPACE || e.keyCode === constants.KEY_ENTER) {
                        if (this.pauseMenuSelectedItem === 1) {
                            this.togglePause();
                        }
                        if (this.pauseMenuSelectedItem === 2) {
                            this.reset();
                        }
                         else if (this.pauseMenuSelectedItem === 3) {
                             this.goToMainMenuScreen.fire();
                            setTimeout(function() {
                                that.pauseMenu.alpha = 0;
                                that.gameWorld.alpha = 1;
                            }, 500);
                        }
                    }
                } else {
                    if (this.isInEndgameCutscene)
                        return;
                    
                    //movement
                    if (e.keyCode === constants.KEY_S || e.keyCode === constants.KEY_DOWN) {
                        this.player.move(0, 1);
                    } else if (e.keyCode === constants.KEY_A || e.keyCode === constants.KEY_LEFT) {
                        this.player.move(-1, 0);
                    } else if (e.keyCode === constants.KEY_W || e.keyCode === constants.KEY_UP) {
                        this.player.move(0, -1);
                    } else if (e.keyCode === constants.KEY_D || e.keyCode === constants.KEY_RIGHT) {
                        this.player.move(1, 0);
                    }
                }
            },
            handleKeyUp: function(e) {

            },
            activate: function () {               
                this.currentLevel = 0;
                assetManager.playMusic('bossa', 0.2);
                if (this.needsReset)
                    this.reset();
                this.paused = false;
            },
           
            tick: function (evt) {
                if (this.inWinState || this.inLoseState || this.paused) {
                    return;
                }
                
                for (var i = 0; i < this.queues.length; i++) {
                    this.queues[i].tick(evt);
                }
                for (var j = 0; j < this.cops.length; j++) {
                    this.cops[j].tick(evt);
                }

                if (this.robber)
                    this.robber.tick(evt);

                //time
                this.timeSinceLevelStart += evt.delta;
                this.timeLabel.text = utils.msToReadableTime(this.timeSinceLevelStart);
                if (this.timeSinceLevelStart > this.currentLevelTimes[1] * 1000)
                    this.timeLabel.color = "red";
                else if (this.timeSinceLevelStart > this.currentLevelTimes[0] * 1000)
                    this.timeLabel.color = "orange";
                
                //item count
                this.itemCountLabel.text = this.player.itemCount;
            },
            reset: function (resetLevels) {
                var that = this;
                var level = resetLevels ? 0 : that.currentLevel;
                this.hide(function() {
                    that.mainView.removeAllChildren();
                    tileManager.clearCollisionMap();
                    that.init.apply(that, [level, that.endGameRetries + (that.inLoseState && that.isInEndGame ? 1 : 0), true]);
                    that.show();
                });
                
            },
            setupEndgame: function () {
                this.zoomIteration = 0;
                this.movieBlocks = new createjs.Shape();
                this.movieBlocks.alpha = 0;
                this.movieBlocks.graphics.beginFill("black").drawRect(0, 0, constants.WORLD_WIDTH, constants.TILE_SIZE)
                    .drawRect(0, constants.WORLD_HEIGHT - constants.TILE_SIZE, constants.WORLD_WIDTH, constants.TILE_SIZE);
                this.gameWorld.addChild(this.movieBlocks);
            },
            activateEndGame: function () {
                analytics.track('Reached Endgame');
                assetManager.stopMusic();
                var that = this;
                that.isInEndgameCutscene = true;
                that.isInEndGame = true;
                createjs.Tween.get(this.movieBlocks).to({ alpha: 1 }, 500, createjs.Ease.quadIn);
                for (var j = 0; j < that.queues.length; j++) {
                    that.queues[j].pauseNpcs = true;
                    that.queues[j].isInEndgame = true;
                }
                setTimeout(function () {
                    assetManager.playMusic('action', 0.5);

                    //robber hitpoints
                    that.robber = new RobberEntity();
                    that.robberHitPointsIcons = new createjs.Container();
                    that.robberHitPointsIcons.x = 386;
                    that.robberHitPointsIcons.y = constants.WORLD_HEIGHT - 42;
                    that.robberHitPointsIcons.alpha = 0;
                    var x = 0;
                    for (var i = 0; i < that.robber.hitPoints; i++) {
                        var heart = new createjs.Bitmap(assetManager.images.robberHeart);
                        heart.x = x;
                        that.robberHitPointsIcons.addChild(heart);
                        x += 36;
                    }
                    that.gameWorld.addChild(that.robberHitPointsIcons);
                    that.robber.sayingSomething.add(function(npc) {
                        that.npcInDialog = npc;
                    });
                    that.robber.tookHit.add(function () {
                        that.gameWorld.removeChild(that.robberHitPointsIcons[that.robberHitPointsIcons.length - 1]);
                        that.robberHitPointsIcons.removeChildAt(0);
                    });
                    
                    //enter robber
                    that.gameWorld.addChild(that.robber.view);
                    var row = 5, col = 13;
                    if (tileManager.collisionMap[row][col]) {
                        row = 6;
                        if (tileManager.collisionMap[row][col]) {
                            row = 4;
                            if (tileManager.collisionMap[row][col]) {
                                row = 5;
                                col = 12;
                                that.robber.ignoreNpcsWhenMoving = true;
                            }
                        }
                    }
                    that.robber.movementDestination = { row: row, col: col };
                    that.robber.shouldMove = true;
                    that.robber.finishedMoving.add(function sayStickup() {
                        that.robber.say(text.getRobberText(text.robber.enterTexts, that.endGameRetries), 5000, function () {
                            //move everyone to the back
                            var count = 0;
                            for (var j = 0; j < that.queues.length; j++) {
                                that.queues[j].pauseNpcs = false;
                                for (var i = 0; i < that.queues[j].allNpcs.length; i++) {
                                    var npc = that.queues[j].allNpcs[i];
                                    that.moveNpcOffScreen(npc, count, that);
                                    count++;
                                }
                            }

                            //move cops out
                            for (var j = 0; j < that.cops.length; j++) {
                                var cop = that.cops[j];
                                that.moveNpcOffScreen(cop, count, that);
                                count++;
                            }

                            that.endgameNpcsOnScreenCount = count;

                            //move cashiers to the corners
                            for (var j = 0; j < that.queues.length; j++) {
                                var cashier = that.queues[j].cashier;
                                cashier.avatar.gotoAndPlay('scared');
                                cashier.movementDestination = constants.CORNERS[j];
                                cashier.shouldMove = true;
                            }
                        });
                        that.robber.finishedMoving.remove(sayStickup);
                        setTimeout(function() {
                            that.robber.movementDestination = { row: 5, col: 9 };
                            that.robber.shouldMove = true;
                            that.robber.finishedMoving.add(function continueConversation() {
                                that.robber.finishedMoving.remove(continueConversation);
                                that.continueEndGameWithRobber.apply(that);
                            });

                        },7000);
                    });
                    
                    //hide UI elements
                    that.timeLabel.alpha = 0;
                    that.bag.alpha = 0;
                    that.itemCountLabel.alpha = 0;
                }, 3000);

            },
            moveNpcOffScreen:function(npc, count, that) {
                npc.avatar.gotoAndPlay('scared');
                npc.ignorePlayerWhenMoving = true;
                npc.movementSpeed = (2 * npc.movementSpeed) / 3; //speed things up
                npc.movementDestination = { row: constants.ENTRY_ROWS[count % constants.ENTRY_ROWS.length], col: -1 };
                npc.finishedMoving.add(function (n) {
                    that.gameWorld.removeChild(n.view);
                    tileManager.collisionMap[n.row][n.col] = false;
                    that.endgameNpcsOnScreenCount--;
                });
                npc.shouldMove = true;
            },
            continueEndGameWithRobber: function () {
                var that = this;
                this.robber.say(text.getRobberText(text.robber.afterEveryoneLeaves, that.endGameRetries)[0], 5000, function () {
                    that.robber.say(text.getRobberText(text.robber.afterEveryoneLeaves, that.endGameRetries)[1], 6000, function () {
                        that.robber.say(text.getRobberText(text.robber.afterEveryoneLeaves, that.endGameRetries)[2], 6000, function () {
                            createjs.Tween.get(that.movieBlocks).to({ alpha: 0 }, 500, createjs.Ease.quadIn).call(function () {
                                that.isInEndgameCutscene = false;
                                var count = 0;
                                that.player.moved.add(function tookStep() {
                                    count++;
                                    if (count < 4) {
                                        that.isInEndgameCutscene = true;
                                        var msg = '';
                                        if (count === 1)
                                            msg = text.getRobberText(text.robber.provoked, that.endGameRetries)[0];
                                        else if (count === 2)
                                            msg = text.getRobberText(text.robber.provoked, that.endGameRetries)[1];
                                        else {
                                            msg = text.getRobberText(text.robber.provoked, that.endGameRetries)[2];
                                        }
                                        createjs.Tween.get(that.movieBlocks).to({ alpha: 1 }, 500, createjs.Ease.quadIn);
                                        that.robber.say(msg, 3000, function () {
                                            createjs.Tween.get(that.movieBlocks).to({ alpha: 0 }, 500, createjs.Ease.quadIn);
                                            that.isInEndgameCutscene = false;
                                            if (count === 3) {
                                                that.player.moved.remove(tookStep);
                                                createjs.Tween.get(that.robberHitPointsIcons).to({ alpha: 1 }, 300, createjs.Ease.quadIn);
                                                that.startBossFight.apply(that);
                                            }
                                        });
                                    }
                                });
                            });
                        });

                    });

                });
            },
            startBossFight: function () {
                var that = this;
                
                this.robber.kill(this.player);
                this.robber.died.add(function () {
                    assetManager.playMusic('win',0.3);
                    createjs.Tween.get(that.movieBlocks).to({ alpha: 1 }, 500, createjs.Ease.quadIn);
                    that.isInEndgameCutscene = true;
                    //pick cashier
                    var cashier = that.player.row > 5 ? that.queues[1].cashier : that.queues[0].cashier;
                    cashier.movementDestination = { row: that.player.row, col: that.player.col >= 13 ? that.player.col - 1 : that.player.col + 1 };
                    cashier.shouldMove = true;
                    //create a bigger speech bubbles
                    cashier.createSpeechBubble(constants.TILE_SIZE * 2, constants.TILE_SIZE * 2, -constants.TILE_SIZE / 2, '13px', 15);
                    that.gameWorld.removeChild(cashier.view);
                    that.gameWorld.addChild(cashier.view);
                    cashier.sayingSomething.add(function (npc) {
                        that.npcInDialog = npc;
                    });
                    cashier.finishedMoving.add(function () {
                        that.cashierEndDialog.apply(that,[cashier,0]);
                    });

                });
            },
            cashierEndDialog: function (cashier, index) {
                var that = this;
                cashier.say(text.cashierEndTexts[index], 3000, function () {
                    index++;
                    if (index < text.cashierEndTexts.length) {
                        that.cashierEndDialog.apply(that, [cashier, index]);
                        if(index == text.cashierEndTexts.length - 1)
                            assetManager.stopMusic();
                    } else {
                        that.zoomInterval = setInterval(function() {
                            that.endZoomIn.apply(that);
                        }, 1000);
                    }
                },true);
            },
            endZoomIn: function () {
                var that = this;
                assetManager.playSound('thud');
                if (this.zoomIteration === 6) { //cut to black, go to main menu
                    clearInterval(this.zoomInterval);
                    this.gameWorld.alpha = 0;
                    setTimeout(function () {
                        that.needsReset = true;
                        that.goToMainMenuScreen.fire();
                        analytics.track('Finished Game');
                    }, 1000);
                }
                if (this.zoomIteration === 0) {
                    this.player.avatar.gotoAndPlay('still');
                }
                this.gameWorld.regX = this.getZoomRegX(this.zoomIteration);
                this.gameWorld.regY = this.getZoomRegY(this.zoomIteration);
                this.gameWorld.scaleX = this.gameWorld.scaleY = this.gameWorld.scaleY * 2;
                this.zoomIteration++;

            },
            getZoomRegY: function (iteration) {
                if (iteration === 0)
                    return this.player.view.y - 110;
                else if(iteration === 1)
                    return this.player.view.y - 45;
                else if(iteration === 2)
                    return this.player.view.y - 13;
                else if(iteration === 3)
                    return this.player.view.y +3;
                else if(iteration === 4)
                    return this.player.view.y + 12;
                else if (iteration === 5)
                    return this.player.view.y +15;
            },
            getZoomRegX: function (iteration) {
                if (iteration === 0)
                    return this.player.view.x-160;
                else if(iteration === 1)
                    return this.player.view.x -70;
                else if(iteration === 2)
                    return this.player.view.x -23;
                else if (iteration === 3)
                    return this.player.view.x + 1;
                else if(iteration === 4)
                    return this.player.view.x + 13;
                else if (iteration === 5)
                    return this.player.view.x + 19;
            }
            
            
        });
    });
///#source 1 1 /Scripts/app/InstructionsScreen.js
define('InstructionsScreen',
    ['MenuScreen', 'createjs'], function (MenuScreen, createjs) {
        return MenuScreen.extend({
            init: function () {
                this._super();
                var that = this;
                this.goal = this.createOutlinedText('Have the cashier scan all of your items to check out!', 18, 130, 2);
                this.subItem1 = this.createOutlinedText("• Stand in line (or don't)", 18, 200, 2);
                this.subItem2 = this.createOutlinedText("• Be nice to others (or don't)", 18, 230, 2);
                this.subItem3 = this.createOutlinedText("• Be a hero", 18, 260, 2);
                this.subItem4 = this.createOutlinedText("• Arrow/WASD keys to move", 18, 290, 2);
                this.subItem5 = this.createOutlinedText("• Space/Enter to skip dialog", 18, 320, 2);
                this.subItem6 = this.createOutlinedText("• P to pause, M to mute", 18, 350, 2);
                this.subItem7 = this.createOutlinedText("• Mouse over cashiers to see their stats", 18, 380, 2);
                this.mainView.addChild(this.goal, this.subItem1, this.subItem2, this.subItem3, this.subItem4, this.subItem5,
                    this.subItem6, this.subItem7, this.subItem8);

                this.mainView.addEventListener("click", function (evt) {
                        that.goToMainMenuScreen.fire();
                });
            },
            handleKeyDown: function (e) {
                this.goToMainMenuScreen.fire();
            },
        });
    });
///#source 1 1 /Scripts/app/MainMenuScreen.js
define('MainMenuScreen',
    ['MenuScreen', 'createjs', 'constants', 'assetManager'], function (MenuScreen, createjs, constants, assetManager) {
        return MenuScreen.extend({
            init: function () {
                this._super();
                var that = this;
                
                this.menuItems = [];

                this.currentHighlightedItem = 0;
                this.title = this.createOutlinedText('Super Fantasy Queue', 40, constants.WORLD_HEIGHT / 2, 4);
                this.playCampaignItem = this.createOutlinedText('Campaign', 18, 230, 2, this.highlightedColor);
                this.playCampaignItem.alpha = 0;
                this.menuItems.push(this.playCampaignItem);
                this.playEndlessModeItem = this.createOutlinedText('Endless mode (coming soon)', 18, 270, 2, 'gray', 'black');
                this.playEndlessModeItem.alpha = 0;
                this.menuItems.push(this.playEndlessModeItem);
                this.instructionsItem = this.createOutlinedText('How to play', 18, 310, 2);
                this.instructionsItem.alpha = 0;
                this.menuItems.push(this.instructionsItem);
                this.creditsItem = this.createOutlinedText('Credits', 18, 350, 2);
                this.creditsItem.alpha = 0;
                this.menuItems.push(this.creditsItem);
                this.finishedEntrance = false;
                this.mainView.addChild(this.title, this.playCampaignItem, this.playEndlessModeItem, this.instructionsItem, this.creditsItem);


                this.setupMouseInteraction();
                

                //entrance
                var that = this;
                setTimeout(function() {
                    createjs.Tween.get(that.title).to({ y: 120 }, 1000, createjs.Ease.backInOut).call(function () {
                        for (var i = 0; i < that.menuItems.length; i++) {
                            createjs.Tween.get(that.menuItems[i]).to({ alpha: 1 }, 500, createjs.Ease.quadIn);
                            setTimeout(function () {
                                that.finishedEntrance = true;
                            }, 500);
                        }
                    });
                }, 1000);
            },
            activate:function() {
                assetManager.playMusic('bossa',0.2);
            },
            setupMouseInteraction:function() {
                var that = this;
                
                this.playCampaignItem.addEventListener("mouseover", function (evt) {
                    for (var j = 0; j < that.menuItems.length; j++) {
                        if (j == 1)
                            continue;
                        that.menuItems[j].main.color = that.menuItems[j] === that.playCampaignItem ? that.highlightedColor : that.unHighlightedColor;
                    }
                    that.currentHighlightedItem = 0;
                });
                this.playCampaignItem.addEventListener("click", function (evt) {
                    that.goToGameScreen.fire();
                });
                this.instructionsItem.addEventListener("mouseover", function (evt) {
                    for (var j = 0; j < that.menuItems.length; j++) {
                        if (j == 1)
                            continue;
                        that.menuItems[j].main.color = that.menuItems[j] === that.instructionsItem ? that.highlightedColor : that.unHighlightedColor;
                    }
                    that.currentHighlightedItem = 2;
                });
                this.instructionsItem.addEventListener("click", function (evt) {
                    that.goToInstructionsScreen.fire();
                });
                this.creditsItem.addEventListener("mouseover", function (evt) {
                    for (var j = 0; j < that.menuItems.length; j++) {
                        if (j == 1)
                            continue;
                        that.menuItems[j].main.color = that.menuItems[j] === that.creditsItem ? that.highlightedColor : that.unHighlightedColor;
                    }
                    that.currentHighlightedItem = 3;
                });
                this.creditsItem.addEventListener("click", function (evt) {
                    that.goToCreditsScreen.fire();
                });
            },
            handleKeyDown: function (e) {
                if (!this.finishedEntrance)
                    return;
                if (e.keyCode === constants.KEY_S || e.keyCode === constants.KEY_DOWN) {
                    this.moveOneItemDown();
                } else if (e.keyCode === constants.KEY_W || e.keyCode === constants.KEY_UP) {
                    this.moveOneItemUp();
                }
                if (e.keyCode == constants.KEY_SPACE || e.keyCode == constants.KEY_ENTER) {
                    if (this.currentHighlightedItem == 0)
                        this.goToGameScreen.fire();
                    else if (this.currentHighlightedItem == 2)
                        this.goToInstructionsScreen.fire();
                    else if (this.currentHighlightedItem == 3)
                        this.goToCreditsScreen.fire();
                }
            },
            handleKeyUp: function (e) {

            },
            moveOneItemDown: function () {
                this.menuItems[this.currentHighlightedItem].main.color = this.unHighlightedColor;
                if (this.currentHighlightedItem == 0) //skip coming soon
                    this.currentHighlightedItem = 2; 
                else if (this.currentHighlightedItem == this.menuItems.length -1)
                    this.currentHighlightedItem = 0;
                else
                    this.currentHighlightedItem++;
                this.menuItems[this.currentHighlightedItem].main.color = this.highlightedColor;
            },
            moveOneItemUp:function() {
                this.menuItems[this.currentHighlightedItem].main.color = this.unHighlightedColor;
                if (this.currentHighlightedItem == 0) 
                    this.currentHighlightedItem = this.menuItems.length - 1;
                else if (this.currentHighlightedItem == 2)//skip coming soon
                    this.currentHighlightedItem = 0;
                else
                    this.currentHighlightedItem--;
                this.menuItems[this.currentHighlightedItem].main.color = this.highlightedColor;
            }
        });
    });
///#source 1 1 /Scripts/app/MenuScreen.js
define('MenuScreen',
    ['Screen', 'createjs', 'assetManager'], function (Screen, createjs, assetManager) {
        return Screen.extend({
            init: function() {
                this._super();
                var bg = new createjs.Bitmap(assetManager.images.bg);
                bg.alpha = 0.4;
                this.mainView.addChild(bg);
            }
        });
    });
///#source 1 1 /Scripts/app/NpcEntity.js
define('NpcEntity',
    ['CreatureEntity', 'createjs', 'utils', 'text', 'tileManager', 'constants', 'assetManager'],
    function (CreatureEntity, createjs, utils, text, tileManager, constants, assetManager) {
        return CreatureEntity.extend({
            init: function (row, col, index) {
                this.mistakeWasMade = false;
                this.isNpc = true;
                this.placeInLine = -1;
                this._super(row, col, index);
                this.movementSpeed = Math.floor(Math.random() * (constants.MAX_MOVEMENT_SPEED - constants.MIN_MOVEMENT_SPEED)) + constants.MIN_MOVEMENT_SPEED;
                this.shouldMove = false;
                this.movementDestination = null;
                this.timeSinceLastMove = 0;
                this.isAggresive = Math.random() < constants.CHANCE_OF_BEING_AGRESSIVE;
                this.numOfWarningsAfterLineCutting = 0;
                this.killMode = false;
                this.ignorePlayerWhenMoving = false;
                this.ignoreNpcsWhenMoving = false;

                //calbacks
                this.playerIsBlockingMove = $.Callbacks();
                this.finishedMoving = $.Callbacks();
            },
            setItemCount: function() {
                this.initialItemCount = this.itemCount = Math.floor(Math.random() * 3 + 3);
            },
            bump: function () {
                assetManager.playSound('bump');
                this.hit();
                if (this.hitPoints === 0) {
                    this.die();
                    return;
                }
                var orgPos = utils.getAbsolutePositionByGridPosition(this.row, this.col);
                this.randomShake(orgPos, this, 6);
                if (!this.killMode) {
                    this.say(text.getRandomText(text.bumpTexts));
                }
                
            },
            randomShake: function (startPos, that,maxDelta) {
                var deltaX = Math.round(Math.random() * maxDelta) - 1;
                var deltaY = Math.round(Math.random() * maxDelta) - 1;
                createjs.Tween.get(that.view).to({ x: startPos.x + deltaX, y: startPos.y + deltaY }, 10, createjs.Ease.linear).call(
                    function () {
                        if (maxDelta > 0 &&
                            (!that.shouldMove || that.timeSinceLastMove < that.movementSpeed)) //not currently moving
                            that.randomShake(startPos, that, maxDelta - 1);
                        else {
                            utils.resetPosition(that);
                        }
                    });
            },
            tick: function (evt) {
                if (this.shouldMove) {
                    this.checkForDestinationReached(); //destination was point of beginning
                    this.timeSinceLastMove += evt.delta;
                    if (this.timeSinceLastMove >= this.movementSpeed) {
                        var nextPosition = this.getNextPosition();
                        if (nextPosition.col != this.col || nextPosition.row !== this.row) {
                            this.setPosition(nextPosition.row, nextPosition.col);
                            this.checkForDestinationReached(); //destination reached
                            this.moved.fire(this);
                        }
                        this.timeSinceLastMove = 0;
                    }
                }
            },
            getNextPosition: function () {
//                if (this.movementDestination.row == 4 && this.movementDestination.col == 15)
//                    debugger;
                var nextCol = this.col + Math.sign(this.movementDestination.col - this.col);
                var nextRow = this.row + Math.sign(this.movementDestination.row - this.row);
                //check for collision
                var collisionResult = this.checkForCollision(nextRow, nextCol);
                if (collisionResult.bumpedPlayer) { //this is it, wait for next step
                    nextRow = this.row;
                    nextCol = this.col;
                } else if (collisionResult.collision) { //has collision, try to find another way
                    if (nextRow != this.row) {
                        nextRow = this.row;
                        collisionResult = this.checkForCollision(nextRow, nextCol);
                        if (collisionResult.collision) {
                            nextCol = this.col; //cant advance
                        }
                    }
                    else {
                        nextCol = this.col; //cant advance
                    }
                } 
                return { row: nextRow, col: nextCol };
            },
            checkForCollision: function (row, col) {
                var collision = false,
                    bumpedPlayer = false;
                
                var creature = tileManager.collisionMap[row][col];
                if (creature) //occupied
                {
                    if (creature.isPlayer) {
                        collision = !this.ignorePlayerWhenMoving;
                        bumpedPlayer = !this.ignorePlayerWhenMoving && this.killMode && this.bumpPlayer(creature);
                        this.playerIsBlockingMove.fire(this);
                    } else {
                        collision = !creature.isNpc || !this.ignoreNpcsWhenMoving;
                    }
                }
                return { collision: collision, bumpedPlayer: bumpedPlayer};
            },
            bumpPlayer:function(player) {
                var that = this;
                var orgPos = utils.getAbsolutePositionByGridPosition(this.row, this.col);
                var destX = Math.sign(player.view.x - this.view.x) * 10 + this.view.x,
                    destY = Math.sign(player.view.y - this.view.y) * 10 + this.view.y;
                createjs.Tween.get(that.view).to({ x: destX, y: destY }, 50, createjs.Ease.linear).call(function() {
                    player.bump(that);
                    createjs.Tween.get(that.view).to({ x: orgPos.x, y: orgPos.y }, 50, createjs.Ease.linear);
                });
                return true;
            },
            checkForDestinationReached: function () {
                if (this.col === this.movementDestination.col &&
                            this.row === this.movementDestination.row) {
                    this.shouldMove = false;
                    this.finishedMoving.fire(this);
                }
            },
            kill: function (creature) {
                var that = this;
                this.killMode = true;
                this.shouldMove = true;
                this.movementDestination = { row: creature.row, col: creature.col };
                if (this.itemCountLabel)
                    this.hideItemCount();
                creature.moved.add(function() {
                    that.movementDestination = { row: creature.row, col: creature.col };
                });
            },
            die: function () {
                this.shouldMove = false;
                this._super();
                this.speechBubble.alpha = 0;
                if (this.itemCountLabel)
                    this.hideItemCount();
            }          
        });
    });
///#source 1 1 /Scripts/app/PlayerEntity.js
define('PlayerEntity',
    ['createjs', 'CreatureEntity', 'text', 'constants', 'tileManager', 'assetManager', 'utils'],
    function (createjs, CreatureEntity, text, constants, tileManager, assetManager, utils) {
        return CreatureEntity.extend({
            init: function (row, col) {
                this._super(row, col, 0);
                this.isPlayer = true;
                this.hitPoints = 3;
                
                //Callbacks
                this.winState = $.Callbacks();
                this.loseState = $.Callbacks();
            },
            createView: function(x, y) {
                this._super(x, y);
                this.itemCountLabel.alpha = 0;

            },
            move: function (x, y) {
                if (this.isDead)
                    return;
                var newRow = this.row + y,
                    newCol = this.col + x;
                
                if (!tileManager.collisionMap[newRow][newCol] && //check for collision
                    newRow >= 0 && newRow < constants.NUM_ROWS && //check bounds
                    newCol >= 0 && newCol < constants.NUM_COLUMNS) {
                    this.setPosition(newRow, newCol);
                    assetManager.playSound('walk');
//                    this.setItemCount(); //reset items scanned
                    this.moved.fire();
                } else if (tileManager.collisionMap[newRow][newCol] && tileManager.collisionMap[newRow][newCol].isNpc) {
                    var npc = tileManager.collisionMap[newRow][newCol];
                    var that = this;
                    var orgPos = utils.getAbsolutePositionByGridPosition(this.row, this.col);
                    var destX = Math.sign(npc.view.x - this.view.x) * 10 + this.view.x,
                        destY = Math.sign(npc.view.y - this.view.y) * 10 + this.view.y;
                    createjs.Tween.get(that.view).to({ x: destX, y: destY }, 50, createjs.Ease.linear).call(function () {
                        npc.bump(that);
                        createjs.Tween.get(that.view).to({ x: orgPos.x, y: orgPos.y }, 50, createjs.Ease.linear);
                    });
                }
            },
            removeItem: function () {
                this._super();
                if (this.itemCount === 0) { //win state
                    this.winState.fire();
                }
            },
            bump: function (npc) {
                assetManager.playSound('bump');
                var that = this;
                var orgPos = utils.getAbsolutePositionByGridPosition(this.row, this.col);
                this.randomShake(orgPos, this, 6);
                this.hit();
                if (this.hitPoints == 0) {
                    this.die(function () {
                        var txt;
                        if (npc.isCop)
                            txt = text.getRandomText(text.killedByCopTexts);
                        else if (npc.isRobber) 
                            txt = text.getRandomText(text.killedByRobberTexts);
                        else 
                            txt = text.getRandomText(text.killedByNpcTexts);
                        that.loseState.fire(txt);
                    });
                }
            },
           
            randomShake: function (startPos, that, maxDelta) {
                var deltaX = Math.round(Math.random() * maxDelta) - 1;
                var deltaY = Math.round(Math.random() * maxDelta) - 1;
                createjs.Tween.get(that.view).to({ x: startPos.x + deltaX, y: startPos.y + deltaY }, 10, createjs.Ease.linear).call(
                    function () {
                        if (maxDelta > 0)
                            that.randomShake(startPos, that, maxDelta - 1);
                        else {
                            utils.resetPosition(that);
                        }
                    });
            },
            
        });
    });
///#source 1 1 /Scripts/app/Queue.js
define('Queue',
    ['createjs', 'NpcEntity', 'constants', 'utils', 'assetManager', 'CashierEntity', 'tileManager', 'text'],
    function (createjs, NpcEntity, constants, utils, assetManager, CashierEntity, tileManager, text) {
        return Class.extend({
            init: function(player, row, col, maxCreatures, minCreatures, entryRow, exitRow) {
                var that = this;
                this.row = row;
                this.col = col;
                this.player = player;
                this.entryRow = entryRow;
                this.exitRow = exitRow;
                this.maxCreatures = maxCreatures;
                this.minCreatures = minCreatures;
                this.npcsInQueue = [];
                this.allNpcs = [];
                this.mistakeDialogStarted = false;
                this.isInEndgame = false;
                this.pauseNpcs = false;
                
                //times
                this.timeSinceLastScan = 0;
                this.timeSinceLastNpcAddCheck = 0;
                this.timeSinceLastCalledToMoveUp = -1;
                this.timeSinceLastWarnedAboutLineCutting = -1;

                //create cashier and table
                this.cashier = new CashierEntity(row - 1, col + this.maxCreatures + 1);
                this.cashier.died.add(function () {
                    that.npcDied.fire();
                });
                tileManager.collisionMap[this.cashier.row][this.cashier.col] = this.cashier;
                this.table = new createjs.Bitmap(assetManager.images.table);
                this.tablePosition = { row: row, col: col + this.maxCreatures + 1 };
                this.firstInLinePosition = { row: row, col: col + this.maxCreatures };
                var pos = utils.getAbsolutePositionByGridPosition(this.tablePosition.row, this.tablePosition.col);
                this.table.x = pos.x;
                this.table.y = pos.y + 6;
                this.table.scaleX = 1.2;
                this.cashRegister = new createjs.Bitmap(assetManager.images.cashRegister);
                this.cashRegister.x = pos.x + 2;
                this.cashRegister.y = pos.y;
                this.currentItem = null;

                //create npcs in queue
                this.numOfCreatures = Math.round(Math.random() * (maxCreatures - minCreatures) + minCreatures);
                for (var i = 0; i < this.numOfCreatures; i++) {
                    this.createNewNpc(this.row, col + this.maxCreatures - i);

                }

                //callbacks
                this.viewAdded = $.Callbacks();
                this.viewRemoved = $.Callbacks();
                this.npcDied = $.Callbacks();

                //handle player move
                this.player.moved.add(function() {
                    that.handlePlayerMove.apply(that); //fire in context
                });
            },
            createNewNpc: function(row, col) {
                var that = this;
                var npc = new NpcEntity(row, col);
                npc.placeInLine = this.npcsInQueue.length;
                this.npcsInQueue.push(npc);
                this.allNpcs.push(npc);
                this.setNpcToAdvanceInQueue(npc);
                npc.playerIsBlockingMove.add(function(sender) {
                    that.npcIsBlockedByPlayer.apply(that, [sender]);
                });
                npc.died.add(function() {
                    that.npcsInQueue.splice(that.npcsInQueue.indexOf(npc, 1));
                    that.allNpcs.splice(that.allNpcs.indexOf(npc), 1);
                    that.npcDied.fire();
                });
                return npc;
            },
            getViews: function () {
                var views = [];
                views.push(this.cashier.view);
                views.push(this.table);
                views.push(this.cashRegister);
                if (this.currentItem) {
                    views.push(this.currentItem);
                }
                for (var i = 0; i < this.allNpcs.length; i++) {
                    views.push(this.allNpcs[i].view);
                }

                return views;

            },
            tick: function (evt) {
                //advance times
                if (this.timeSinceLastCalledToMoveUp !== -1) {
                    this.timeSinceLastCalledToMoveUp += evt.delta;
                    if (this.timeSinceLastCalledToMoveUp > constants.TIME_BETWEEN_CALLS_TO_MOVE_UP)
                        this.timeSinceLastCalledToMoveUp = -1;
                }
                if (this.timeSinceLastWarnedAboutLineCutting !== -1) {
                    this.timeSinceLastWarnedAboutLineCutting += evt.delta;
                    if (this.timeSinceLastWarnedAboutLineCutting > constants.TIME_BETWEEN_WARNINGS)
                        this.timeSinceLastWarnedAboutLineCutting = -1;
                }

                //tick rest
                if (!this.pauseNpcs) {
                    for (var i = 0; i < this.allNpcs.length; i++) {
                        this.allNpcs[i].tick(evt);
                    }
                }

                if (this.isInEndgame) {
                    this.cashier.tick(evt);
                    return;
                }

                //scan
                var creature = tileManager.collisionMap[this.firstInLinePosition.row][this.firstInLinePosition.col];
                if (creature && !this.cashier.isDead) {
                    if (!this.mistakeDialogStarted) {
                        this.timeSinceLastScan += evt.delta;
                        if (this.timeSinceLastScan >= this.cashier.timeToScan) {
                            this.timeSinceLastScan = 0;
                            this.scan(creature);
                        }
                    }
                }

                //check if need to add new npc
                if (this.npcsInQueue.length < constants.MAX_CREATURES_IN_QUEUE) {
                    this.timeSinceLastNpcAddCheck += evt.delta;
                    if (this.timeSinceLastNpcAddCheck > constants.TIME_TO_MAYBE_ADD_NPC_TO_QUEUE) {
                        this.timeSinceLastNpcAddCheck = 0;
                        if (Math.random() > constants.CHANCE_OF_NEW_NPC) {
                            this.addNewNpc();
                        }
                    }
                }
            },
            scan: function (creature) {
                if (this.currentItem) {
                    this.viewRemoved.fire(this.currentItem);
                }
                if (creature.itemCount > 0) {
                    creature.removeItem();
                    this.currentItem = this.getRandomItem();
                    var pos = utils.getAbsolutePositionByGridPosition(this.row, this.col + this.maxCreatures + 1);
                    this.currentItem.x = pos.x + 27;
                    this.currentItem.y = pos.y + 9;
                    this.viewAdded.fire(this.currentItem);
                    assetManager.playSound('beep', 0.1);
                } else if (creature.isNpc) { //npc
                    //chance for mistake
                    if (!creature.mistakeWasMade && Math.random() * 10 > this.cashier.accuracy) {
                        this.startMistakeDialog(creature);
                    }
                    else {
                        creature.hideItemCount();
                        this.leave(creature);
                    }
                }
            },
            startMistakeDialog: function (creature) {
                this.mistakeDialogStarted = true;
                var that = this;
                creature.mistakeWasMade = true;
                creature.say(text.getRandomText(text.mistakeTexts), 3000, function () {
                    if (this.isInEndgame)
                        return;
                    that.cashier.say(text.getRandomText(text.cashierMistakeTexts), 3000, function () {
                        creature.itemCount = creature.initialItemCount;
                        that.mistakeDialogStarted = false;
                    }, 2000);
                }, 2000);
            },
            getRandomItem: function () {
                var index = Math.random() * 129;
                var data = {
                    images: [assetManager.images.items],
                    frames: { width: 16, height: 16 },
                    animations: {
                        idle: { frames: [index], speed: 0 }
                    }
                };
                var spriteSheet = new createjs.SpriteSheet(data);
                var sprite = new createjs.Sprite(spriteSheet, 'idle');
                return sprite;
            },
            setNpcToAdvanceInQueue: function (npc) {
                npc.movementDestination = { row: this.tablePosition.row, col: this.tablePosition.col - 1 };
                npc.shouldMove = true;

            },
            leave: function (creature) {
                //init the npc to leave
                creature.placeInLine = -1;
                this.moveUpInLine();
                this.npcsInQueue.splice(0, 1);
                creature.shouldMove = true;

                //set the destination
                var destRow = this.exitRow;
                var destCol = constants.NUM_COLUMNS;
                creature.movementDestination = { row: destRow, col: destCol };

                //remove npc once it left
                var that = this;
                creature.finishedMoving.add(function () {
                    that.viewRemoved.fire(this.view);
                    tileManager.collisionMap[creature.row][creature.col] = false;
                    that.allNpcs.splice(that.allNpcs.indexOf(creature), 1);
                    creature = null;
                });

            },
            moveUpInLine: function () {
                for (var i = 0; i < this.npcsInQueue.length; i++) {
                    this.npcsInQueue[i].placeInLine--;
                }
            },
            addNewNpc: function () {
                if (tileManager.collisionMap[this.entryRow][0]) //someone is already occupying that square
                    return;
                var npc = this.createNewNpc(this.entryRow, 0);
                this.viewAdded.fire(npc.view);
            },
            handlePlayerMove: function () {
                if (this.isInEndgame)
                    return;
                
                if (this.player.row === this.row) {
                    if (this.npcsInQueue.length > 1 &&
                        this.npcsInQueue[this.npcsInQueue.length - 1].col < this.player.col && //last
                        this.player.col < this.tablePosition.col) {
                        if (!this.playerInQueue) { //cut in line
                            var cutee = null;
                            for (var i = 0; i < this.npcsInQueue.length; i++) { //get the closest cutee
                                if (this.npcsInQueue[i].col < this.player.col) { //yell 
                                    if (!cutee)
                                        cutee = this.npcsInQueue[i];
                                    else {
                                        cutee = this.player.col - this.npcsInQueue[i].col <
                                            this.player.col - cutee.col ? this.npcsInQueue[i] : cutee;
                                    }
                                }
                            }
                            if (cutee) {
                                if (cutee.placeInLine === this.npcsInQueue.length - 1 && //last in line
                                    this.player.col - cutee.col > 1) //didn't reach end of the line yet, not quite cutting in line
                                    cutee.say(text.getRandomText(text.notQuiteCutInLineTexts));
                                else {
                                    cutee.say(text.getRandomText(text.cutInLineTexts), 1500);
                                    this.playerCutInLine = true;
                                    this.timeSinceLastWarnedAboutLineCutting = 0;
                                }
                            }
                        }
                    }
                } else {
                    this.playerCutInLine = false;
                }
                this.playerInQueue = this.player.row === this.row;
            },
            npcIsBlockedByPlayer: function (npc) {
                if (this.isInEndgame)
                    return;
                
                if (this.timeSinceLastCalledToMoveUp === -1 ){ //enough time passed                   
                    if (!this.playerCutInLine &&
                        !tileManager.collisionMap[this.row][this.player.col + 1] && //has place to advance
                        this.player.col < this.tablePosition.col - 1) { //not first in line
                        npc.say(text.getRandomText(text.playerHoldingUpLine));
                    }
                    this.timeSinceLastCalledToMoveUp = 0;
                }
                
                if (this.timeSinceLastWarnedAboutLineCutting === -1) {
                    if (this.playerCutInLine) {
                        if (npc.numOfWarningsAfterLineCutting < constants.NUM_OF_WARNINGS_BEFORE_ENGAGING) {
                            npc.say(text.getRandomText(text.warnAfterLineCutting), 1500);
                            npc.numOfWarningsAfterLineCutting++;
                        } else {
                            if (npc.isAggresive) {
                                npc.kill(this.player);
                            }
                        }
                    }
                    this.timeSinceLastWarnedAboutLineCutting = 0;
                }
            }
        });
    });
///#source 1 1 /Scripts/app/RobberEntity.js
define('RobberEntity',
    ['createjs', 'CreatureEntity', 'text', 'constants', 'assetManager', 'NpcEntity'], function (createjs, CreatureEntity, text, constants, assetManager, NpcEntity) {
        return NpcEntity.extend({
            init: function () {
                this._super(5, 14);
                this.hitPoints = 9;
                this.isRobber = true;

            },
            createSpriteSheet: function () {
                var animationSpeed = Math.random() * 0.04 + 0.06;
                var data = {
                    images: [assetManager.images.robber],
                    frames: { width: this.size.w, height: this.size.h },
                    animations: {
                        idle: { frames: [0, 1], speed: animationSpeed },
                    }
                };
                this.spriteSheet = new createjs.SpriteSheet(data);
            },
            createView: function (x, y) {
                this.view = new createjs.Container();

                //speech bubble
                this.createSpeechBubble(constants.TILE_SIZE * 2, constants.TILE_SIZE*2, -constants.TILE_SIZE /2, '13px', 15);

                this.avatar = new createjs.Sprite(this.spriteSheet, 'idle');
                this.avatar.regX = this.avatar.regY = this.size.w / 2;
                this.avatar.x = this.avatar.y = this.size.w / 2;
                this.view.addChild(this.avatar);
                this.view.x = x;
                this.view.y = y;
            },
            say:function(txt, timeout, callback) {
                this._super(txt, timeout || 5000, callback, true);
            }

        });
    });
///#source 1 1 /Scripts/app/Screen.js
define('Screen',
    ['createjs', 'constants'],
    function (createjs, constants) {
        return Class.extend({
            init: function() {
                this.mainView = new createjs.Container();
                this.mainView.alpha = 0;
                this.goToMainMenuScreen = $.Callbacks();
                this.goToGameScreen = $.Callbacks();
                this.goToCreditsScreen = $.Callbacks();
                this.goToInstructionsScreen = $.Callbacks();
                this.highlightedColor = 'Khaki';
                this.unHighlightedColor = 'white';
            },
            handleKeyDown: function(e) {

            },
            handleKeyUp: function(e) {

            },
            activate: function() {

            },
            tick: function(evt) {

            },
            show: function(callback) {
                createjs.Tween.get(this.mainView).to({ alpha: 1 }, 300, createjs.Ease.quadIn).call(function() {
                    if (callback) {
                        callback();
                    }
                });
            },
            hide: function (callback) {
                createjs.Tween.get(this.mainView).to({ alpha: 0 }, 300, createjs.Ease.quadIn).call(function () {
                    if (callback) {
                        callback();
                    }
                });
            },
            createOutlinedText: function (text, fontsize, y, offset, color, outlineColor) {
                var main = new createjs.Text(text, fontsize + "px " + constants.FONT + "", color || 'white');
                main.textAlign = 'center';
                main.textBaseline = 'middle';
                main.x = constants.WORLD_WIDTH / 2;
                main.y = 0;
                var outline = new createjs.Text(text, fontsize + "px " + constants.FONT + "", outlineColor || 'gray');
                outline.textAlign = 'center';
                outline.textBaseline = 'middle';
                outline.x = constants.WORLD_WIDTH / 2 + offset;
                outline.y = offset;
                var container = new createjs.Container();
                container.x = 0;
                container.y = y;
                container.setBounds(0, y, constants.WORLD_WIDTH, fontsize);
                container.addChild(outline, main);
                container.main = main;
                container.outline = outline;
                container.regY = fontsize / 2;
                container.setText = function (txt) {
                    this.main.text = txt;
                    this.outline.text = txt;
                };
                container.setLineWidth = function(width) {
                    this.main.lineWidth = width;
                    this.outline.lineWidth = width;                    
                };
                container.setLineHeight = function (height) {
                    this.main.lineHeight = height;
                    this.outline.lineHeight = height;
                };
                var hit = new createjs.Shape();
                hit.graphics.beginFill("#000").drawRect(0, -3, constants.WORLD_WIDTH, fontsize + 6);
                container.hitArea = hit;
                return container;
            }
        });
    });
///#source 1 1 /Scripts/app/screenManager.js
define('screenManager',
    ['createjs', 'GameScreen', 'MainMenuScreen', 'CreditsScreen', 'InstructionsScreen', 'SplashScreen'],
    function (createjs, GameScreen, MainMenuScreen, CreditsScreen, InstructionsScreen, SplashScreen) {
        var screens = [],
            currentScreen,
            splashScreen,
            loadSplash = function(callback) {
                splashScreen = new SplashScreen(callback);
            },
            init = function () {
                screens.push(new MainMenuScreen());
                screens.push(new GameScreen());
                screens.push(new CreditsScreen());
                screens.push(new InstructionsScreen());
                currentScreen = screens[0];
                var that = this;

                screens[0].goToGameScreen.add(function() {
                    that.goToScreen(1);
                });
                screens[0].goToCreditsScreen.add(function () {
                    that.goToScreen(2);
                });
                screens[0].goToInstructionsScreen.add(function () {
                    that.goToScreen(3);
                });
                screens[1].goToMainMenuScreen.add(function () {
                    that.goToScreen(0);
                });
                screens[2].goToMainMenuScreen.add(function () {
                    that.goToScreen(0);
                });
                screens[3].goToMainMenuScreen.add(function () {
                    that.goToScreen(0);
                });

            },
            goToScreen = function(index) {
                currentScreen.hide(function() {
                    currentScreen = screens[index];
                    currentScreen.show(function() {
                        currentScreen.activate();
                    });
                });
            };

        return {
            init: init,
            screens:screens,
            gameScreen: function() {return screens[1]; },
            getCurrentScreen: function () { return currentScreen; },
            goToScreen: goToScreen,
            loadSplash: loadSplash,
            splashScreen: function () { return splashScreen; },
        };
});
///#source 1 1 /Scripts/app/SplashScreen.js
define('SplashScreen',
    ['Screen', 'assetManager', 'createjs'], function (Screen, assetManager, createjs) {
        return Screen.extend({
            init: function (callback) {
                var that = this;
                
                this._super();
                this.logo = new createjs.Bitmap('./Content/Images/logo.png');
                this.logo.y = 80;
                this.logo.x = 230;
//                this.logo.scaleX = this.logo.scaleY = 1.5;
                this.mainView.addChild(this.logo);

                this.progressLabel = this.createOutlinedText('0%', 36, 340, 4);
                this.mainView.addChild(this.progressLabel);

                //load assets
                assetManager.loadAssets();
                assetManager.progressChangedEvent.add(function (progress) {
                    that.progressLabel.setText(Math.floor(progress * 100) + '%');

                });
                assetManager.loadCompleteEvent.add(function() {
                    that.hide(function() {
                        callback();
                    });
                    
                });
                this.show();
            }
        });
    });
///#source 1 1 /Scripts/app/text.js
define('text',
    [], function () {
        var names = {
            cashier: {
                first: ['Shelby', 'Patsy', 'Lou Ann', 'Ginny', 'Mae', 'Trina', 'Winona', 'Naomi', 'Shirleen', 'Bitsy', 'Doreen', 'Tanya', 'Tammy', 'Lurleen', 'Peggy', 'Pearl', 'Billie', 'Betty', 'Opal',
                    'Cheyenne', 'Angel', 'Loretta', 'Condoleeza', 'Sadie', 'Twyla', 'Rhonda', 'Crystal'],
                last: ['Ann', 'Lou', 'Lee', 'Kay', 'Marie', 'Lynn', 'Jo', 'Mae', 'April', 'Sue']
            },
            npc: []
        },
            getCashierName = function(maxChars) {
                var name = '';

                while (!name || name.length > maxChars) {
                    name = names.cashier.first[Math.floor(Math.random() * names.cashier.first.length)] + ' ' +
                        names.cashier.last[Math.floor(Math.random() * names.cashier.last.length)];
                    if (!maxChars)
                        break;
                }
                return name;
            },
            mistakeTexts = [
                'I think you made mistake',
                'No way this costs 10 gold',
                'Did you scan my coupons?',
                "It should be '2 for 1' on the picklocks"
            ],
            cashierMistakeTexts = [
              "Sorry, I'll have to do it again sir",
              "I'll do it again right now"
            ],
            bumpTexts = [
                'Hey!',
                'Watch it!',
                "I'm walking here! I'm walking here!",
                "Have you heard of personal space!?",
                'Step back buddy!',
                'You wanna go outside?!',
                'Do that one more time, I dare you',
                'Well excuse you!',
                "What's your problem man?!",
                "Sorry didn't mean to get in your way",
                "Please don't hurt me",
                "Watch it my dad is level 30",
                "Watch where you're walking grandpa",
                "Am I in a 'The Verve' video clip?"
            ],
            cutInLineTexts = [
                'Line cutter!',
                'Not fair mate!',
                'Back of the line!',
                'Who do you think you are?!',
                "Cut the line and I'll cut you!",
                "Oh no you didn't",
                "It's ok, none of us are in a rush",
                "Go ahead sir fancy pants",
                "Walking right through? Lah-di-da",
                "Ohhhhh, goooood for you"
            ],
            notQuiteCutInLineTexts = [
                "I'll let this one slide",
                'Sneaky bastard',
                "Think you're clever",
                "Bad karma for you",
                "Beat me to it",
                "So close!",
                "Frankly, my dear, I give a damn",
                "Objection!"
            ],
            playerHoldingUpLine = [
                'Move up pal!',
                'Wake up!',
                "We're gonna be here all day",
                'Take your time buddy',
                "HELLO",
                "Anybody home mcfly?!",
                "No rush, I like waiting in line",
                "Don't mind me I've got all day",
                "Move it along Sunday driver",
                "Speed it up slowpoke",
            ],
            warnAfterLineCutting = [
                "I'm warning you!",
                "Last warning!",
                'Step out now friend!',
                'Last chance to leave with your teeth',
                "You won't like me when I'm angry",
                "Let me introduce you to my little friend",
                "The gloves are coming off",
                "No more mister nice guy",
                "Just give me an excuse dude",
                "You wanna keep that pretty face?",
                "We're done professionally",
                "Are you f****** SORRY!",
                "Have you thought about your last words?",
                "let me introduce you to the floor",
                "Go ahead, make my day",
                "Would you kindly step out of the way?"
            ],
            robber = {
                enterTexts: ['Nobody move! This is a stick-up!',
                    "What's the line again? oh yeah, stick-up!"
                ],
                afterEveryoneLeaves:[
                    ['Did they not hear me say "nobody move?"', "ANYWAY", "The money in the bag, NOW!"],
                    ['Yeah yeah run away', "Well", "You know what to do - money -> bag"]
                ],
                provoked: [
                    ["I said DON'T MOVE", "Don't be a hero", "Let's do this!"],
                    ["You again?", "This didn't turn out well for you last time", "Here we go!"]
                ]
                
            },
            cashierEndTexts = [
                'You saved us!',
                '(Like you had a choice)',
                'We would like to thank you, and give you',
                'Free deliveries for life!',
                'You will never have to stand in line AGAIN!'
            ],
            checkedOutTexts = [
                'Checked out!',
                'Done and done!',
                "A job well done!"
            ],
            killedByCopTexts = [
                "Crime doesn't (always) pay!",
                "You can't hide from the long arm of the law!",
                "Try not to take an arrow to the knee!",
                "Guards are not invincible!"
            ],
            killedByRobberTexts = [
                "Be quick or be dead!",
                "Don't listen to him, be a hero!",
                "With great power comes great responsibility!"
            ],
            killedByNpcTexts = [
                "Cutting in line can be dangerous!",
                "What goes around comes around!",
                "You have died of line cuttery",
                
            ],
            getRobberText = function(arr, index) {
                if (index >= arr.length)
                    return arr[arr.length - 1];
                else 
                    return arr[index];
            },
            checkedOutFastTexts = [
                "Plenty of time to drink some potions with the guys before heading off to the dungeon",
                "You'll get first pick of the princesses",
                "Early bird gets the best loot",
                "A winner is you",
                "Boomshakalaka!"
            ],
            checkedOutMiddleTexts = [
                "Enough time to oil the sword, but not the armor",
                "Stayed a while, and listened?",
                "Took you a while, but you got there"
            ],
            checkedOutSlowTexts = [
                "You won't have enough time to pick up your belt of dexterity +1 from the tailor",
                "You'll have to skip picking up your gauntlets from dry cleaning",
                "Any slower and you'll check out tomorrow",
                "Did you stop to smell the potions?",
                "There's no cake!",
                "Stay awhile... Stay FOREVER"
            ],
            
        getRandomText = function (arr) {
            return arr[Math.floor(Math.random() * arr.length)];
        };
        return {
            checkedOutFastTexts: checkedOutFastTexts,
            checkedOutSlowTexts:checkedOutSlowTexts,
            checkedOutMiddleTexts:checkedOutMiddleTexts,
            killedByNpcTexts: killedByNpcTexts,
            checkedOutTexts: checkedOutTexts,
            killedByCopTexts: killedByCopTexts,
            killedByRobberTexts: killedByRobberTexts,
            getCashierName: getCashierName,
            mistakeTexts: mistakeTexts,
            getRandomText: getRandomText,
            bumpTexts: bumpTexts,
            cutInLineTexts: cutInLineTexts,
            notQuiteCutInLineTexts: notQuiteCutInLineTexts,
            playerHoldingUpLine: playerHoldingUpLine,
            warnAfterLineCutting: warnAfterLineCutting,
            robber: robber,
            getRobberText: getRobberText,
            cashierEndTexts: cashierEndTexts,
            cashierMistakeTexts: cashierMistakeTexts
        };
    });




///#source 1 1 /Scripts/app/tileManager.js
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
///#source 1 1 /Scripts/app/utils.js
define('utils',
    ['createjs', 'constants'], function (createjs, constants) {
        var
            getAbsolutePositionByGridPosition = function (row, col) {
                return {
                    x: col * constants.TILE_SIZE,
                    y: row * constants.TILE_SIZE
                };
            },
            resetPosition = function (creature) {
                var pos = getAbsolutePositionByGridPosition(creature.row, creature.col);
                creature.view.x = pos.x;
                creature.view.y = pos.y;
            },
            msToReadableTime = function (ms) {
                var totalSeconds = ms / 1000;
                var minutes = Math.floor(totalSeconds / 60);
                var seconds = Math.floor(totalSeconds - minutes * 60);
                return (minutes == 0 ? '00' : (minutes < 10 ? '0' + minutes.toString() : minutes)) + ':' +
                    (seconds == 0 ? '00' : (seconds < 10 ? '0' + seconds.toString() : seconds));

            },
            getTimespanInText = function (ms) {
                var totalSeconds = ms / 1000;
                var minutes = Math.floor(totalSeconds / 60);
                var seconds = Math.floor(totalSeconds - minutes * 60);
                var txt = '';
                if (minutes > 0) {
                    txt = minutes + ' minutes ';
                    if (seconds > 0)
                        txt += 'and ';
                }
                if (seconds > 0)
                    txt += seconds + ' seconds';
                return txt;
            };
        return {
            getTimespanInText: getTimespanInText,
            getAbsolutePositionByGridPosition: getAbsolutePositionByGridPosition,
            resetPosition: resetPosition,
            msToReadableTime: msToReadableTime
        };
    });

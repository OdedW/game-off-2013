define('GameScreen',
    ['createjs', 'Screen', 'PlayerEntity', 'Queue', 'assetManager', 'constants', 'tileManager', 'CopEntity' , 'utils'],
    function (createjs, Screen, PlayerEntity, Queue, assetManager, constants, tileManager, CopEntity, utils) {
        return Screen.extend({

            init: function (level) {
                var that = this;
                this.currentLevel = level || 0;
                this._super();
                this.gameWorld = new createjs.Container();
                this.mainView.addChild(this.gameWorld);

                //win text
                this.endStateText = new createjs.Text('Checked out!', "36px Minecraftia", "white");
                this.endStateText.alpha = 0;               
                this.endStateText.textAlign = 'center';
                this.endStateText.textBaseline = 'middle';
                this.pressAnyKeyText = new createjs.Text('press any key', "16px Minecraftia", "white");
                this.pressAnyKeyText.alpha = 0;
                this.pressAnyKeyText.textAlign = 'center';
                this.pressAnyKeyText.textBaseline = 'middle';
                this.mainView.addChild(this.endStateText, this.pressAnyKeyText);
              
                //gameWorld
                var bg = new createjs.Bitmap(assetManager.images.bg);
                this.gameWorld.addChild(bg);
                this.player = new PlayerEntity(1, 0);
                this.setupLevel();
                this.gameWorld.addChild(this.player.view);
                this.inWinState = false;
                this.inLoseState = false;
                this.player.winState.add(function () {
                    that.inWinState = true;
                    that.showEndState.apply(that, ['Checked out!']);
                });
                this.player.loseState.add(function (text) {
                    that.inLoseState = true;
                    that.showEndState.apply(that, [text]);
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
                var bag = new createjs.Bitmap(assetManager.images.bag);
                bag.x = 185;
                bag.y = 4;
                
                this.itemCountLabel = new createjs.Text(this.player.itemCount, "25px " + constants.FONT, "white");
                this.itemCountLabel.x = 140;
                this.itemCountLabel.y = 0;
                this.gameWorld.addChild(bag, this.itemCountLabel);

                this.cops = [];
            },
            setupLevel: function () {
                this.spawnedCops = false;
                var currentLevel = window.levels[this.currentLevel];
                this.currentLevelTimes = currentLevel.times;
                this.player.itemCount = currentLevel.itemCount;
                this.queues = [];
                for (var i = 0; i < currentLevel.queues.length; i++) {
                    this.createQueue(currentLevel.queues[i]);
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
                    var cop1 = new CopEntity(args[5], constants.NUM_COLUMNS - 1, that.player, this.spawnedCops);
                    var cop2 = new CopEntity(args[4], 0, that.player, !this.spawnedCops);
                    that.cops.push(cop1);
                    that.cops.push(cop2);
                    that.gameWorld.addChild(cop1.view, cop2.view);
                    this.spawnedCops = true;
                });
                this.queues.push(queue);
            },
            showEndState:function(text) {
                this.endStateText.text = text;
                this.endStateText.x = constants.WORLD_WIDTH / 2;
                this.endStateText.y = constants.WORLD_HEIGHT / 2 - 15;
                this.pressAnyKeyText.x = constants.WORLD_WIDTH / 2;
                this.pressAnyKeyText.y = constants.WORLD_HEIGHT / 2 + 25;
                createjs.Tween.get(this.gameWorld).to({ alpha: 0.2 }, 200, createjs.Ease.quadIn);
                createjs.Tween.get(this.endStateText).to({ alpha: 1 }, 200, createjs.Ease.quadIn);
                createjs.Tween.get(this.pressAnyKeyText).to({ alpha: 1 }, 200, createjs.Ease.quadIn);
            },
            handleKeyDown: function (e) {
                if (this.inWinState || this.inLoseState) {
                    this.currentLevel += this.inWinState ? 1 : 0;
                    this.needsReset.fire();
                }
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
            },
            handleKeyUp: function(e) {

            },
            activate: function() {

            },
           
            tick: function (evt) {
                if (this.inWinState || this.inLoseState) {
                    return;
                }
                for (var i = 0; i < this.queues.length; i++) {
                    this.queues[i].tick(evt);
                }
                for (var j = 0; j < this.cops.length; j++) {
                    this.cops[j].tick(evt);
                }
                
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
            reset: function () {
                var that = this;
                that.mainView.removeAllChildren();
                tileManager.clearCollisionMap();
                that.init(that.currentLevel);
            },
        });
    });
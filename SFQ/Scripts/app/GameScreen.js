define('GameScreen',
    ['createjs', 'Screen', 'PlayerEntity', 'Queue', 'assetManager', 'constants', 'tileManager', 'CopEntity' , 'utils'],
    function (createjs, Screen, PlayerEntity, Queue, assetManager, constants, tileManager, CopEntity, utils) {
        return Screen.extend({

            init: function () {
                var that = this;

                this._super();
                this.gameWorld = new createjs.Container();
                this.mainView.addChild(this.gameWorld);

                //win text
                this.endStateText = new createjs.Text('Checked out!', "36px Minecraftia", "white");
                this.endStateText.alpha = 0;               
                this.endStateText.textAlign = 'center';
                this.endStateText.textBaseline = 'middle';
                this.mainView.addChild(this.endStateText);
              
                //gameWorld
                var bg = new createjs.Bitmap(assetManager.images.bg);
                this.gameWorld.addChild(bg);
                this.queues = [];
                this.player = new PlayerEntity(1, 0);
                this.createQueue(2, 2, 8, 5, 3, 4);
                this.createQueue(5, 2, 8, 5, 5, 5);
                this.createQueue(8, 2, 8, 5, 9, 6);
                this.gameWorld.addChild(this.player.view);
                this.inWinState = false;
                this.player.winState.add(function () {
                    that.endStateText.text = 'Checked out!';
                    that.endStateText.x = constants.WORLD_WIDTH / 2;
                    that.endStateText.y = constants.WORLD_HEIGHT / 2;
                    createjs.Tween.get(that.gameWorld).to({ alpha: 0.2 }, 500, createjs.Ease.quadIn);
                    createjs.Tween.get(that.endStateText).to({ alpha: 1 }, 500, createjs.Ease.quadIn);
                    that.inWinState = true;
                });
                this.player.loseState.add(function (text) {
                    that.endStateText.text = text;
                    that.endStateText.x = constants.WORLD_WIDTH / 2;
                    that.endStateText.y = constants.WORLD_HEIGHT / 2;
                    createjs.Tween.get(that.gameWorld).to({ alpha: 0.2 }, 200, createjs.Ease.quadIn);
                    createjs.Tween.get(that.endStateText).to({ alpha: 1 }, 200, createjs.Ease.quadIn);
                    that.inWinState = true;
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
                this.timeLabel = new createjs.Text('00:00', "25px " + constants.FONT, "white");
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
            handleKeyDown: function (e) {
                if (this.inWinState) {
                    return;
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
            createQueue: function(row, col, min, max, entry, exit) {
                var queue = new Queue(this.player, row, col, min, max, entry, exit);
                var views = queue.getViews();
                for (var i = 0; i < views.length; i++) {
                    this.gameWorld.addChild(views[i]);
                }
                var that = this;
                queue.viewAdded.add(function(view) {
                    that.gameWorld.removeChild(that.player.view); //player is always on top
                    that.gameWorld.addChild(view);
                    that.gameWorld.addChild(that.player.view);

                });
                queue.viewRemoved.add(function(view) {
                    that.gameWorld.removeChild(view);
                });

                queue.npcDied.add(function() {
                    var cop1 = new CopEntity(exit, constants.NUM_COLUMNS - 1, that.player);
                    var cop2 = new CopEntity(entry, 0, that.player);
                    that.cops.push(cop1);
                    that.cops.push(cop2);
                    that.gameWorld.addChild(cop1.view, cop2.view);
                });
                this.queues.push(queue);
            },
            tick: function (evt) {
                if (this.inWinState) {
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
                
                //item count
                this.itemCountLabel.text = this.player.itemCount;
            },
            reset: function () {
                tileManager.clearCollisionMap();
                this.init();
            },
           
        });
    });
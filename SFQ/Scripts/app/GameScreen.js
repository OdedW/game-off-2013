define('GameScreen',
    ['createjs', 'Screen', 'PlayerEntity', 'Queue', 'assetManager', 'constants', 'tileManager'],
    function (createjs, Screen, PlayerEntity, Queue, assetManager, constants, tileManager) {
        return Screen.extend({
            init: function() {
                this._super();
                this.gameWorld = new createjs.Container();
                this.mainView.addChild(this.gameWorld);

                //win text
                this.winText = new createjs.Text('Checked out!', "36px Minecraftia", "white");
                this.winText.alpha = 0;
                var b = this.winText.getBounds();
                this.winText.x = 200;
                this.winText.y = 230;
                this.mainView.addChild(this.winText);

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
                var that = this;
                this.player.winState.add( function() {
                    createjs.Tween.get(that.gameWorld).to({ alpha: 0.2 }, 500, createjs.Ease.quadIn);
                    createjs.Tween.get(that.winText).to({ alpha: 1 }, 500, createjs.Ease.quadIn);
                    that.inWinState = true;
                });
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
                this.queues.push(queue);
            },
            tick: function (evt) {
                if (this.inWinState) {
                    return;
                }
                for (var i = 0; i < this.queues.length; i++) {
                    this.queues[i].tick(evt);
                }
            },
            reset: function() {
                tileManager.clearCollisionMap();
                this.init();
            },
           
        });
    });
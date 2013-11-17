define('GameScreen',
    ['Screen', 'PlayerEntity', 'Queue', 'assetManager', 'constants'],
    function (Screen, PlayerEntity, Queue, assetManager, constants) {
        return Screen.extend({
            init: function () {
                this._super();
                var bg = new createjs.Bitmap(assetManager.images.bg);
                this.mainView.addChild(bg);
                this.queues = [];
                this.createQueue(2, 2, 8, 5, 3, 4);
                this.createQueue(5, 2, 8, 5, 5, 5);
                this.createQueue(8, 2, 8, 5, 9, 6);
                this.player = new PlayerEntity(1, 0);
                this.mainView.addChild(this.player.view);
            },
            handleKeyDown: function (e) {
                //movement
                if (e.keyCode === constants.KEY_S || e.keyCode === constants.KEY_DOWN) {
                    this.player.move(0, 1);
                }
                else if (e.keyCode === constants.KEY_A || e.keyCode === constants.KEY_LEFT) {
                    this.player.move(-1, 0);
                }
                else if (e.keyCode === constants.KEY_W || e.keyCode === constants.KEY_UP) {
                    this.player.move(0, -1);
                }
                else if (e.keyCode === constants.KEY_D || e.keyCode === constants.KEY_RIGHT) {
                    this.player.move(1, 0);
                }
               
            },
            handleKeyUp: function (e) {

            },
            activate: function () {

            },
            createQueue: function (row, col, min, max, entry, exit) {
                var queue = new Queue(row, col, min, max, entry, exit);
                var views = queue.getViews();
                for (var i = 0; i < views.length; i++) {
                    this.mainView.addChild(views[i]);
                }
                var that = this;
                queue.viewAdded.add(function (view) {
                    that.mainView.removeChild(that.player.view); //player is always on top
                    that.mainView.addChild(view);
                    that.mainView.addChild(that.player.view);

                });
                queue.viewRemoved.add(function (view) {
                    that.mainView.removeChild(view);
                });
                this.queues.push(queue);
            },
            tick: function (evt) {
                for (var i = 0; i < this.queues.length; i++) {
                    this.queues[i].tick(evt);
                }
            },
            reset: function () {
                this.init();
            }
        })
    });
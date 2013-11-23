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
                this.hitPoints = 5;
            }
        });
    });
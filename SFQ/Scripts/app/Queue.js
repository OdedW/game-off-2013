define('Queue',
    ['createjs', 'NpcEntity', 'constants', 'utils', 'assetManager', 'CashierEntity'], function (createjs, NpcEntity, constants, utils, assetManager, CashierEntity) {
        return Class.extend({
            init: function (row, col, maxCreatures, minCreatures) {
                this.row = row;
                this.col = col;
                this.maxCreatures = maxCreatures;
                this.minCreatures = minCreatures;
                this.npcs = [];
                this.numOfCreatures = Math.round(Math.random() * (maxCreatures - minCreatures) + minCreatures);
                for (var i = 0; i < this.numOfCreatures; i++) {
                    var creature = new NpcEntity(row, col + this.maxCreatures - i);
                    this.npcs.push(creature);
                }
                this.cashier = new CashierEntity(row - 1, col + this.maxCreatures + 1);
                this.table = new createjs.Bitmap(assetManager.images['table']);
                var pos = utils.getAbsolutePositionByGridPosition(row , col + this.maxCreatures + 1);
                this.table.x = pos.x+4;
                this.table.y = pos.y+6;
            },
            getViews: function () {
                var views = [];
                views.push(this.cashier.view);
                views.push(this.table);
                for (var i = 0; i < this.npcs.length; i++) {
                    views.push(this.npcs[i].view);
                }
                
                return views;

            }
        })
    });
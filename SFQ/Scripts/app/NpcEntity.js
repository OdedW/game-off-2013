define('NpcEntity',
    ['CreatureEntity', 'createjs'], function (CreatureEntity, createjs) {
        return CreatureEntity.extend({
            init: function (row, col) {
                this.mistakeWasMade = false;
                this._super(row, col);

            },
            createView: function (x, y) {
                this._super(x, y);

               
            },
            setItemCount: function() {
                this.initialItemCount = this.itemCount = Math.floor(Math.random() * 3 + 3);
            }
        });
    });
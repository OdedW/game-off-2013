define('NpcEntity',
    ['CreatureEntity', 'createjs'], function (CreatureEntity, createjs) {
        return CreatureEntity.extend({
            init: function (row, col) {
                this.initialItemCount = this.itemCount = Math.floor(Math.random() * 3 + 3);
                this.mistakeWasMade = false;
                this._super(row, col);
            },
            createView: function (x, y) {
                this._super(x, y);

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
            removeItem: function () {
                if (this.itemCount > 0) {
                    this.itemCount--;
                    this.itemCountText.text = this.itemCount;
                }
            }
        });
    });
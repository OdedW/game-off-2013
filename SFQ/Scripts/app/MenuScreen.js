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
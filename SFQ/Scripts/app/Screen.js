define('Screen',
    ['createjs'],
    function (createjs) {
        return Class.extend({
            init: function() {
                this.mainView = new createjs.Container();
                this.mainView.alpha = 0;
                if (!this.needsReset) //don't create again after reset
                    this.needsReset = $.Callbacks(); 
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
                createjs.Tween.get(this.mainView).to({ alpha: 1 }, 500, createjs.Ease.quadIn).call(function() {
                    if (callback) {
                        callback();
                    }
                });
            },
            hide: function (callback) {
                createjs.Tween.get(this.mainView).to({ alpha: 0 }, 500, createjs.Ease.quadIn).call(function () {
                    if (callback) {
                        callback();
                    }
                });
            }
        });
    });
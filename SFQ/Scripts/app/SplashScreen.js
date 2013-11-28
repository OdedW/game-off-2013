define('SplashScreen',
    ['Screen', 'assetManager', 'createjs'], function (Screen, assetManager, createjs) {
        return Screen.extend({
            init: function (callback) {
                var that = this;
                
                this._super();
                this.logo = new createjs.Bitmap('/content/images/logo.png');
                this.logo.y = 80;
                this.logo.x = 230;
//                this.logo.scaleX = this.logo.scaleY = 1.5;
                this.mainView.addChild(this.logo);

                this.progressLabel = this.createOutlinedText('0%', 36, 340, 4);
                this.mainView.addChild(this.progressLabel);

                //load assets
                assetManager.loadAssets();
                assetManager.progressChangedEvent.add(function (progress) {
                    that.progressLabel.setText(Math.floor(progress * 100) + '%');

                });
                assetManager.loadCompleteEvent.add(function() {
                    that.hide(function() {
                        callback();
                    });
                    
                });
                this.show();
            }
        });
    });
define('screenManager',
    ['createjs', 'GameScreen', 'MainMenuScreen', 'CreditsScreen', 'InstructionsScreen', 'SplashScreen'],
    function (createjs, GameScreen, MainMenuScreen, CreditsScreen, InstructionsScreen, SplashScreen) {
        var screens = [],
            currentScreen,
            splashScreen,
            loadSplash = function(callback) {
                splashScreen = new SplashScreen(callback);
            },
            init = function () {
                screens.push(new MainMenuScreen());
                screens.push(new GameScreen());
                screens.push(new CreditsScreen());
                screens.push(new InstructionsScreen());
                currentScreen = screens[0];
                var that = this;

                screens[0].goToGameScreen.add(function() {
                    that.goToScreen(1);
                });
                screens[0].goToCreditsScreen.add(function () {
                    that.goToScreen(2);
                });
                screens[0].goToInstructionsScreen.add(function () {
                    that.goToScreen(3);
                });
                screens[1].goToMainMenuScreen.add(function () {
                    that.goToScreen(0);
                });
                screens[2].goToMainMenuScreen.add(function () {
                    that.goToScreen(0);
                });
                screens[3].goToMainMenuScreen.add(function () {
                    that.goToScreen(0);
                });

            },
            goToScreen = function(index) {
                currentScreen.hide(function() {
                    currentScreen = screens[index];
                    currentScreen.show(function() {
                        currentScreen.activate();
                    });
                });
            };

        return {
            init: init,
            screens:screens,
            gameScreen: function() {return screens[1]; },
            getCurrentScreen: function () { return currentScreen; },
            goToScreen: goToScreen,
            loadSplash: loadSplash,
            splashScreen: function () { return splashScreen; },
        };
});
define('screenManager',
    ['createjs', 'GameScreen'], 
    function (createjs, GameScreen) {
        var
            screens = [],
            currentScreen,
            init = function () {
                screens.push(new GameScreen());
                currentScreen = screens[0];
            };

        return {
            init: init,
            gameScreen: screens[0],
            getCurrentScreen: function () { return currentScreen; }
        };
});
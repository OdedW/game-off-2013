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

        init();
        return {
            gameScreen: screens[0],
            currentScreen: currentScreen
        };
});
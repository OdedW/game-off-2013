define('utils',
    ['createjs', 'constants'], function (createjs, constants) {
        var
            getAbsolutePositionByGridPosition = function (row, col) {
                return {
                    x: col * constants.TILE_SIZE,
                    y: row * constants.TILE_SIZE
                };
            },
            resetPosition = function (creature) {
                var pos = getAbsolutePositionByGridPosition(creature.row, creature.col);
                creature.view.x = pos.x;
                creature.view.y = pos.y;
            },
            msToReadableTime = function (ms) {
                var totalSeconds = ms / 1000;
                var minutes = Math.floor(totalSeconds / 60);
                var seconds = Math.floor(totalSeconds - minutes * 60);
                return (minutes == 0 ? '00' : (minutes < 10 ? '0' + minutes.toString() : minutes)) + ':' +
                    (seconds == 0 ? '00' : (seconds < 10 ? '0' + seconds.toString() : seconds));

            },
            getTimespanInText = function (ms) {
                var totalSeconds = ms / 1000;
                var minutes = Math.floor(totalSeconds / 60);
                var seconds = Math.floor(totalSeconds - minutes * 60);
                var txt = '';
                if (minutes > 0) {
                    txt = minutes + ' minutes ';
                    if (seconds > 0)
                        txt += 'and ';
                }
                if (seconds > 0)
                    txt += seconds + ' seconds';
                return txt;
            };
        return {
            getTimespanInText: getTimespanInText,
            getAbsolutePositionByGridPosition: getAbsolutePositionByGridPosition,
            resetPosition: resetPosition,
            msToReadableTime: msToReadableTime
        };
    });
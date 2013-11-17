﻿define('text',
    [], function() {
        var names = {
            cashier:{
                first: ['Shelby','Patsy','Lou Ann','Ginny','Mae','Trina','Winona', 'Naomi','Shirleen','Bitsy','Doreen','Tanya','Tammy','Lurleen','Peggy','Pearl','Billie','Betty','Opal',
                        'Cheyenne','Angel','Loretta','Condoleeza','Sadie','Twyla','Rhonda','Crystal'],
                last: ['Ann','Lou','Lee','Kay','Marie','Lynn','Jo','Mae','April','Sue' ]

                },
            npc: []
        },
            getCashierName = function (maxChars) {
                var name = '';

                while (!name || name.length > maxChars){
                    name = names.cashier.first[Math.floor(Math.random() * names.cashier.first.length)] + ' ' +
                    names.cashier.last[Math.floor(Math.random() * names.cashier.last.length)];
                    if (!maxChars)
                        break;
                }
                return name;
            };
                
        mistakeTexts = [
            'You made a mistake there...',
            'No way this costs 10 gold',
            'Did you scan my coupons?',
            'It should be 2 for 1 picklocks!'
        ],
        getRandomText = function (arr) {
            return arr[Math.floor(Math.random() * arr.length)];
        };
        return {
            getCashierName: getCashierName,
            mistakeTexts: mistakeTexts,
            getRandomText: getRandomText
        };
});




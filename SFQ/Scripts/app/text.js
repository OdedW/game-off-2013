define('text',
    [], function () {
        var names = {
            cashier: {
                first: ['Shelby', 'Patsy', 'Lou Ann', 'Ginny', 'Mae', 'Trina', 'Winona', 'Naomi', 'Shirleen', 'Bitsy', 'Doreen', 'Tanya', 'Tammy', 'Lurleen', 'Peggy', 'Pearl', 'Billie', 'Betty', 'Opal',
                    'Cheyenne', 'Angel', 'Loretta', 'Condoleeza', 'Sadie', 'Twyla', 'Rhonda', 'Crystal'],
                last: ['Ann', 'Lou', 'Lee', 'Kay', 'Marie', 'Lynn', 'Jo', 'Mae', 'April', 'Sue']
            },
            npc: []
        },
            getCashierName = function(maxChars) {
                var name = '';

                while (!name || name.length > maxChars) {
                    name = names.cashier.first[Math.floor(Math.random() * names.cashier.first.length)] + ' ' +
                        names.cashier.last[Math.floor(Math.random() * names.cashier.last.length)];
                    if (!maxChars)
                        break;
                }
                return name;
            },
            mistakeTexts = [
                'You made a mistake there...',
                'No way this costs 10 gold',
                'Did you scan my coupons?',
                'It should be 2 for 1 picklocks!'
            ],
            bumpTexts = [
                'Hey!',
                'Watch it!',
                "Hey I'm walking here!",
                "You're invading my personal space!",
                'Step back buddy!'
            ],
            cutInLineTexts = [
                'Line cutter!',
                'Not fair mate!',
                'Back of the line!'
            ],
            notQuiteCutInLineTexts = [
                "I'll let this one slide",
                'Sneaky bastard',
                "Think you're clever"
            ],
            playerHoldingUpLine = [
                'Move up pal!',
                'Wake up!',
                "We're gonna be here all day",
                'Take your time buddy'
            ],
            warnAfterLineCutting = [
                "I'm warning you!",
                "Last warning!",
                'Step out now friend!'
            ],
            robber = {
                enterTexts: ['Nobody move! This is a stick-up!',
                    "What's the line again? oh yeah, stick-up!"
                ],
                afterEveryoneLeaves:[
                    ['Did they not hear me say "nobody move?"', "ANYWAY", "The money in the bag, NOW!"],
                    ['Yeah yeah run away', "Well", "You know what to do - money -> bag"]
                ],
                provoked: [
                    ["I said DON'T MOVE", "Don't be a hero", "Let's do this!"],
                    ["You again?", "This didn't turn up well for you last time", "Here we go!"]
                ]
                
            },
            cashierEndTexts = [
                'You saved us!',
                '(Like you had a choice)',
                'We would like to thank you, and give you',
                'Free deliveries for life!',
                'You will never have to stand in line AGAIN!'
            ],

            getRobberText = function(arr, index) {
                if (index >= arr.length)
                    return arr[arr.length - 1];
                else 
                    return arr[index];
            },
        getRandomText = function (arr) {
            return arr[Math.floor(Math.random() * arr.length)];
        };
        return {
            getCashierName: getCashierName,
            mistakeTexts: mistakeTexts,
            getRandomText: getRandomText,
            bumpTexts: bumpTexts,
            cutInLineTexts: cutInLineTexts,
            notQuiteCutInLineTexts: notQuiteCutInLineTexts,
            playerHoldingUpLine: playerHoldingUpLine,
            warnAfterLineCutting: warnAfterLineCutting,
            robber: robber,
            getRobberText: getRobberText,
            cashierEndTexts: cashierEndTexts
        };
    });




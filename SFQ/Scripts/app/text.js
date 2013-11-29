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
                'I think you made mistake',
                'No way this costs 10 gold',
                'Did you scan my coupons?',
                "It should be '2 for 1' on the picklocks"
            ],
            cashierMistakeTexts = [
              "Sorry, I'll have to do it again sir",
              "I'll do it again right now"
            ],
            bumpTexts = [
                'Hey!',
                'Watch it!',
                "I'm walking here! I'm walking here!",
                "Have you heard of personal space!?",
                'Step back buddy!',
                'You wanna go outside?!',
                'Do that one more time, I dare you',
                'Well excuse you!',
                "What's your problem man?!",
                "Sorry didn't mean to get in your way",
                "Please don't hurt me",
                "Watch it my dad is level 30",
                "Watch where you're walking grandpa",
                "Am I in a 'The Verve' video clip?"
            ],
            cutInLineTexts = [
                'Line cutter!',
                'Not fair mate!',
                'Back of the line!',
                'Who do you think you are?!',
                "Cut the line and I'll cut you!",
                "Oh no you didn't",
                "It's ok, none of us are in a rush",
                "Go ahead sir fancy pants",
                "Walking right through? Lah-di-da",
                "Ohhhhh, goooood for you"
            ],
            notQuiteCutInLineTexts = [
                "I'll let this one slide",
                'Sneaky bastard',
                "Think you're clever",
                "Bad karma for you",
                "Beat me to it",
                "So close!",
                "Frankly, my dear, I give a damn",
                "Objection!"
            ],
            playerHoldingUpLine = [
                'Move up pal!',
                'Wake up!',
                "We're gonna be here all day",
                'Take your time buddy',
                "HELLO",
                "Anybody home mcfly?!",
                "No rush, I like waiting in line",
                "Don't mind me I've got all day",
                "Move it along Sunday driver",
                "Speed it up slowpoke",
            ],
            warnAfterLineCutting = [
                "I'm warning you!",
                "Last warning!",
                'Step out now friend!',
                'Last chance to leave with your teeth',
                "You won't like me when I'm angry",
                "Let me introduce you to my little friend",
                "The gloves are coming off",
                "No more mister nice guy",
                "Just give me an excuse dude",
                "You wanna keep that pretty face?",
                "We're done professionally",
                "Are you f****** SORRY!",
                "Have you thought about your last words?",
                "let me introduce you to the floor",
                "Go ahead, make my day",
                "Would you kindly step out of the way?"
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
                    ["You again?", "This didn't turn out well for you last time", "Here we go!"]
                ]
                
            },
            cashierEndTexts = [
                'You saved us!',
                '(Like you had a choice)',
                'We would like to thank you, and give you',
                'Free deliveries for life!',
                'You will never have to stand in line AGAIN!'
            ],
            checkedOutTexts = [
                'Checked out!',
                'Done and done!',
                "A job well done!"
            ],
            killedByCopTexts = [
                "Crime doesn't (always) pay!",
                "You can't hide from the long arm of the law!",
                "Try not to take an arrow to the knee!",
                "Guards are not invincible!"
            ],
            killedByRobberTexts = [
                "Be quick or be dead!",
                "Don't listen to him, be a hero!",
                "With great power comes great responsibility!"
            ],
            killedByNpcTexts = [
                "Cutting in line can be dangerous!",
                "What goes around comes around!",
                "You have died of line cuttery",
                
            ],
            getRobberText = function(arr, index) {
                if (index >= arr.length)
                    return arr[arr.length - 1];
                else 
                    return arr[index];
            },
            checkedOutFastTexts = [
                "Plenty of time to drink some potions with the guys before heading off to the dungeon",
                "You'll get first pick of the princesses",
                "Early bird gets the best loot",
                "A winner is you",
                "Boomshakalaka!"
            ],
            checkedOutMiddleTexts = [
                "Enough time to oil the sword, but not the armor",
                "A job not so well done",
                "Stayed a while, and listened?"
            ],
            checkedOutSlowTexts = [
                "You won't have enough time to pick up your belt of dexterity +1 from the tailor",
                "You'll have to skip picking up your gauntlets from dry cleaning",
                "Any slower and you'll check out tomorrow",
                "Did you stop to smell the potions?",
                "There's no cake!",
                "Stay awhile... Stay FOREVER"
            ],
            
        getRandomText = function (arr) {
            return arr[Math.floor(Math.random() * arr.length)];
        };
        return {
            checkedOutFastTexts: checkedOutFastTexts,
            checkedOutSlowTexts:checkedOutSlowTexts,
            checkedOutMiddleTexts:checkedOutMiddleTexts,
            killedByNpcTexts: killedByNpcTexts,
            checkedOutTexts: checkedOutTexts,
            killedByCopTexts: killedByCopTexts,
            killedByRobberTexts: killedByRobberTexts,
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
            cashierEndTexts: cashierEndTexts,
            cashierMistakeTexts: cashierMistakeTexts
        };
    });




define('GameScreen',
    ['createjs', 'Screen', 'PlayerEntity', 'Queue', 'assetManager', 'constants', 'tileManager', 'CopEntity' , 'utils', 'RobberEntity', 'text', 'analytics'],
    function (createjs, Screen, PlayerEntity, Queue, assetManager, constants, tileManager, CopEntity, utils, RobberEntity, text, analytics) {
        return Screen.extend({

            init: function (level, endGameRetries, afterReset) {
                var that = this;
                this.currentLevel = level || 0;
                analytics.track('Started Level ' + this.currentLevel);
                this.endGameRetries = endGameRetries || 0;
                if (!afterReset) {
                    this._super();
                }
                this.gameWorld = new createjs.Container();
                this.mainView.addChild(this.gameWorld);
                this.isInEndGame = false;

                //win text
                this.endStateText = this.createOutlinedText('', 36, 0, 4);
                this.endStateText.setLineWidth(constants.WORLD_WIDTH - 100);
                this.endStateText.setLineHeight(39);
                this.winStateText = this.createOutlinedText('', 20, 0, 2);
                this.winStateText.setLineHeight(23);
                this.winStateText.setLineWidth(constants.WORLD_WIDTH - 100);
                this.winStateText.alpha = 0;
                this.pressAnyKeyText = this.createOutlinedText('press any key', 12, 0, 2);
                this.endStateContainer = new createjs.Container();
                this.endStateContainer.alpha = 0;
                this.endStateContainer.addChild(this.endStateText,this.winStateText, this.pressAnyKeyText);
                this.mainView.addChild(this.endStateContainer);
              
                //gameWorld
                var bg = new createjs.Bitmap(assetManager.images.bg);
                this.gameWorld.addChild(bg);
                this.setupLevel();
                this.cops = [];
                this.gameWorld.addChild(this.player.view);
                
                //win/lose states
                this.inWinState = false;
                this.inLoseState = false;
                this.player.winState.add(function () {
                    that.inWinState = true;
                    that.showEndState.apply(that, [text.getRandomText(text.checkedOutTexts)]);
                });
                this.player.loseState.add(function (txt) {
                    that.inLoseState = true;
                    that.showEndState.apply(that, [txt]);
                });
                
                //hitpoints
                var x = 10;
                this.hitPointsIcons = [];
                for (var i = 0; i < this.player.hitPoints; i++) {
                    var heart = new createjs.Bitmap(assetManager.images.heart);
                    heart.x = x;
                    heart.y = 6;
                    this.hitPointsIcons.push(heart);
                    this.gameWorld.addChild(heart);
                    x += 36;
                }
                this.player.tookHit.add(function() {
                    that.gameWorld.removeChild(that.hitPointsIcons[that.hitPointsIcons.length - 1]);
                    that.hitPointsIcons.splice(that.hitPointsIcons.length - 1, 1);
                });

                //timer
                this.timeSinceLevelStart = 0;
                this.timeLabel = new createjs.Text('00:00', "25px " + constants.FONT, "#0BF50B");
                this.timeLabel.x = constants.WORLD_WIDTH - 90;
                this.timeLabel.y = -2;
                this.gameWorld.addChild(this.timeLabel);

                //item count
                this.bag = new createjs.Bitmap(assetManager.images.bag);
                this.bag.x = 185;
                this.bag.y = 4;
                
                this.itemCountLabel = new createjs.Text(this.player.itemCount, "25px " + constants.FONT, "white");
                this.itemCountLabel.x = 140;
                this.itemCountLabel.y = 0;
                this.gameWorld.addChild(this.bag, this.itemCountLabel);

                //endgame
                this.setupEndgame();
                this.isInEndgameCutscene = false;
                this.npcInDialog = null;
                
                //pause
                this.paused = false;
                this.pauseMenu = new createjs.Container();
                this.pauseMenu.setBounds(0, 0, constants.WORLD_WIDTH, constants.WORLD_HEIGHT);
                this.levelTitle = this.createOutlinedText('Level ' + (this.currentLevel + 1), 30,100, 3);
                var backToGame = this.createOutlinedText('Continue shopping', 18, 210, 2, this.highlightedColor);
                var resetCampaign = this.createOutlinedText('Reset Campaign', 18, 250, 2);
                var backToMenu = this.createOutlinedText('Back to main menu', 18, 290, 2);
                this.pauseMenu.addChild(this.levelTitle, backToGame, resetCampaign, backToMenu);
                this.pauseMenu.alpha = 0;
                this.pauseMenuSelectedItem = 1;
                this.mainView.addChild(this.pauseMenu);
                backToGame.addEventListener("mouseover", function (evt) {
                    for (var j = 1; j < that.pauseMenu.children.length; j++) {
                        that.pauseMenu.children[j].main.color = that.pauseMenu.children[j] === backToGame ? that.highlightedColor : that.unHighlightedColor;
                    }
                    that.currentHighlightedItem = 0;
                });
                backToGame.addEventListener("click", function (evt) {
                    that.togglePause();
                });
                resetCampaign.addEventListener("mouseover", function (evt) {
                    for (var j = 1; j < that.pauseMenu.children.length; j++) {
                        that.pauseMenu.children[j].main.color = that.pauseMenu.children[j] === resetCampaign ? that.highlightedColor : that.unHighlightedColor;
                    }
                    that.currentHighlightedItem = 0;
                });
                resetCampaign.addEventListener("click", function (evt) {
                    that.reset(true);
                });
                backToMenu.addEventListener("mouseover", function (evt) {
                    for (var j = 1; j < that.pauseMenu.children.length; j++) {
                        that.pauseMenu.children[j].main.color = that.pauseMenu.children[j] === backToMenu ? that.highlightedColor : that.unHighlightedColor;
                    }
                    that.currentHighlightedItem = 0;
                });
                backToMenu.addEventListener("click", function (evt) {
                    that.goToMainMenuScreen.fire();
                    setTimeout(function () {
                        that.pauseMenu.alpha = 0;
                        that.gameWorld.alpha = 1;
                    }, 500);
                });
            },
            togglePause:function() {
                this.paused = !this.paused;
                createjs.Tween.get(this.gameWorld).to({ alpha: this.paused ? 0.2 : 1 }, 200, createjs.Ease.quadIn);
                createjs.Tween.get(this.pauseMenu).to({ alpha: this.paused ? 1 : 0 }, 200, createjs.Ease.quadIn);
            },
            setupLevel: function () {
                var that = this;
                var currentLevel = window.levels[this.currentLevel];
                this.player = new PlayerEntity(currentLevel.entryRow, 0);
                this.currentLevelTimes = currentLevel.times;
                this.player.itemCount = currentLevel.itemCount;
                this.queues = [];
                for (var i = 0; i < currentLevel.queues.length; i++) {
                    this.createQueue(currentLevel.queues[i]);
                }

                if (this.currentLevel === window.levels.length - 1){ //last level, trigger end game
                    this.player.moved.add(function triggerEndGame() {
                        if (that.player.col === 3) {
                            that.player.moved.remove(triggerEndGame);
                            that.activateEndGame();
                        }
                    });
                }
            }, createQueue: function (args) {
                var queue = new Queue(this.player, args[0], args[1], args[2], args[3], args[4], args[5]);
                var views = queue.getViews();
                for (var i = 0; i < views.length; i++) {
                    this.gameWorld.addChild(views[i]);
                }
                var that = this;
                queue.viewAdded.add(function (view) {
                    that.gameWorld.removeChild(that.player.view); //player is always on top
                    that.gameWorld.addChild(view);
                    that.gameWorld.addChild(that.player.view);

                });
                queue.viewRemoved.add(function (view) {
                    that.gameWorld.removeChild(view);
                });

                queue.npcDied.add(function () {                    
                    var cop1 = new CopEntity(args[5], constants.NUM_COLUMNS - 1, that.player, that.cops.length == 0);
                    that.cops.push(cop1);
                    var cop2 = new CopEntity(args[4], 0, that.player, that.cops.length == 0);
                    that.cops.push(cop2);
                    that.gameWorld.addChild(cop1.view, cop2.view);
                });
                this.queues.push(queue);
            },
            showEndState:function(txt) {
                this.endStateText.setText(txt);
                var h = this.endStateText.main.getMeasuredHeight();
                this.endStateText.y = constants.WORLD_HEIGHT / 2 - h * 2 / 3;
                if (this.inWinState) {
                    this.winStateText.alpha = 1;
                    this.winStateText.y = this.endStateText.y + h + 10;
                    this.winStateText.setText(this.getWinStateText());
                    this.pressAnyKeyText.y = this.winStateText.y + this.winStateText.main.getMeasuredHeight() + 20;

                } else {
                    this.winStateText.alpha = 0;
                    this.pressAnyKeyText.y = this.endStateText.y + h + 20;
                }
                createjs.Tween.get(this.gameWorld).to({ alpha: 0.2 }, 200, createjs.Ease.quadIn);
                createjs.Tween.get(this.endStateContainer).to({ alpha: 1 }, 200, createjs.Ease.quadIn);
            },
            getWinStateText:function() {
                var time = this.timeSinceLevelStart;
                var txt = 'You checked out in ' + utils.getTimespanInText(time) + '! ';
                if (time/1000 < this.currentLevelTimes[0]) 
                    txt += text.getRandomText(text.checkedOutFastTexts);
                else if (time / 1000 < this.currentLevelTimes[1])
                    txt += text.getRandomText(text.checkedOutMiddleTexts);
                else
                    txt += text.getRandomText(text.checkedOutSlowTexts);
                return txt;

            },
            handleKeyDown: function (e) {
                var that = this;
                if (e.keyCode == constants.KEY_E)
                    this.activateEndGame();
                if (e.keyCode === constants.KEY_SPACE || e.keyCode === constants.KEY_ENTER) {
                    if (this.npcInDialog)
                        this.npcInDialog.stopSayingSomething();
                }
                
                if (e.keyCode === constants.KEY_P || e.keyCode === constants.KEY_ESC) {
                    this.togglePause();
                }

                if (this.inWinState || this.inLoseState) {
                    this.currentLevel += this.inWinState ? 1 : 0;
                    this.reset();
                }

                

                if (this.paused) {
                    if (e.keyCode === constants.KEY_S || e.keyCode === constants.KEY_DOWN) {
                        for (var i = 1; i < this.pauseMenu.children.length; i++) {
                            this.pauseMenu.children[i].main.color = this.unHighlightedColor;
                        }
                        this.pauseMenuSelectedItem++;
                        if (this.pauseMenuSelectedItem == this.pauseMenu.children.length) this.pauseMenuSelectedItem = 1;
                        this.pauseMenu.children[this.pauseMenuSelectedItem].main.color = this.highlightedColor;
                    } else if(e.keyCode === constants.KEY_W || e.keyCode === constants.KEY_UP) {
                        for (var i = 1; i < this.pauseMenu.children.length; i++) {
                            this.pauseMenu.children[i].main.color = this.unHighlightedColor;
                        }
                        this.pauseMenuSelectedItem--;
                        if (this.pauseMenuSelectedItem == 0) this.pauseMenuSelectedItem = this.pauseMenu.children.length-1;
                        this.pauseMenu.children[this.pauseMenuSelectedItem].main.color = this.highlightedColor;
                    }
                    if (e.keyCode === constants.KEY_SPACE || e.keyCode === constants.KEY_ENTER) {
                        if (this.pauseMenuSelectedItem === 1) {
                            this.togglePause();
                        }
                        if (this.pauseMenuSelectedItem === 2) {
                            this.reset();
                        }
                         else if (this.pauseMenuSelectedItem === 3) {
                             this.goToMainMenuScreen.fire();
                            setTimeout(function() {
                                that.pauseMenu.alpha = 0;
                                that.gameWorld.alpha = 1;
                            }, 500);
                        }
                    }
                } else {
                    if (this.isInEndgameCutscene)
                        return;
                    
                    //movement
                    if (e.keyCode === constants.KEY_S || e.keyCode === constants.KEY_DOWN) {
                        this.player.move(0, 1);
                    } else if (e.keyCode === constants.KEY_A || e.keyCode === constants.KEY_LEFT) {
                        this.player.move(-1, 0);
                    } else if (e.keyCode === constants.KEY_W || e.keyCode === constants.KEY_UP) {
                        this.player.move(0, -1);
                    } else if (e.keyCode === constants.KEY_D || e.keyCode === constants.KEY_RIGHT) {
                        this.player.move(1, 0);
                    }
                }
            },
            handleKeyUp: function(e) {

            },
            activate: function () {               
                this.currentLevel = 0;
                assetManager.playMusic('bossa', 0.2);
                if (this.needsReset)
                    this.reset();
                this.paused = false;
            },
           
            tick: function (evt) {
                if (this.inWinState || this.inLoseState || this.paused) {
                    return;
                }
                
                for (var i = 0; i < this.queues.length; i++) {
                    this.queues[i].tick(evt);
                }
                for (var j = 0; j < this.cops.length; j++) {
                    this.cops[j].tick(evt);
                }

                if (this.robber)
                    this.robber.tick(evt);

                //time
                this.timeSinceLevelStart += evt.delta;
                this.timeLabel.text = utils.msToReadableTime(this.timeSinceLevelStart);
                if (this.timeSinceLevelStart > this.currentLevelTimes[1] * 1000)
                    this.timeLabel.color = "red";
                else if (this.timeSinceLevelStart > this.currentLevelTimes[0] * 1000)
                    this.timeLabel.color = "orange";
                
                //item count
                this.itemCountLabel.text = this.player.itemCount;
            },
            reset: function (resetLevels) {
                var that = this;
                var level = resetLevels ? 0 : that.currentLevel;
                this.hide(function() {
                    that.mainView.removeAllChildren();
                    tileManager.clearCollisionMap();
                    that.init.apply(that, [level, that.endGameRetries + (that.inLoseState && that.isInEndGame ? 1 : 0), true]);
                    that.show();
                });
                
            },
            setupEndgame: function () {
                this.zoomIteration = 0;
                this.movieBlocks = new createjs.Shape();
                this.movieBlocks.alpha = 0;
                this.movieBlocks.graphics.beginFill("black").drawRect(0, 0, constants.WORLD_WIDTH, constants.TILE_SIZE)
                    .drawRect(0, constants.WORLD_HEIGHT - constants.TILE_SIZE, constants.WORLD_WIDTH, constants.TILE_SIZE);
                this.gameWorld.addChild(this.movieBlocks);
            },
            activateEndGame: function () {
                analytics.track('Reached Endgame');
                assetManager.stopMusic();
                var that = this;
                that.isInEndgameCutscene = true;
                that.isInEndGame = true;
                createjs.Tween.get(this.movieBlocks).to({ alpha: 1 }, 500, createjs.Ease.quadIn);
                for (var j = 0; j < that.queues.length; j++) {
                    that.queues[j].pauseNpcs = true;
                    that.queues[j].isInEndgame = true;
                }
                setTimeout(function () {
                    assetManager.playMusic('action', 0.5);

                    //robber hitpoints
                    that.robber = new RobberEntity();
                    that.robberHitPointsIcons = new createjs.Container();
                    that.robberHitPointsIcons.x = 386;
                    that.robberHitPointsIcons.y = constants.WORLD_HEIGHT - 42;
                    that.robberHitPointsIcons.alpha = 0;
                    var x = 0;
                    for (var i = 0; i < that.robber.hitPoints; i++) {
                        var heart = new createjs.Bitmap(assetManager.images.robberHeart);
                        heart.x = x;
                        that.robberHitPointsIcons.addChild(heart);
                        x += 36;
                    }
                    that.gameWorld.addChild(that.robberHitPointsIcons);
                    that.robber.sayingSomething.add(function(npc) {
                        that.npcInDialog = npc;
                    });
                    that.robber.tookHit.add(function () {
                        that.gameWorld.removeChild(that.robberHitPointsIcons[that.robberHitPointsIcons.length - 1]);
                        that.robberHitPointsIcons.removeChildAt(0);
                    });
                    
                    //enter robber
                    that.gameWorld.addChild(that.robber.view);
                    var row = 5, col = 13;
                    if (tileManager.collisionMap[row][col]) {
                        row = 6;
                        if (tileManager.collisionMap[row][col]) {
                            row = 4;
                            if (tileManager.collisionMap[row][col]) {
                                row = 5;
                                col = 12;
                                that.robber.ignoreNpcsWhenMoving = true;
                            }
                        }
                    }
                    that.robber.movementDestination = { row: row, col: col };
                    that.robber.shouldMove = true;
                    that.robber.finishedMoving.add(function sayStickup() {
                        that.robber.say(text.getRobberText(text.robber.enterTexts, that.endGameRetries), 5000, function () {
                            //move everyone to the back
                            var count = 0;
                            for (var j = 0; j < that.queues.length; j++) {
                                that.queues[j].pauseNpcs = false;
                                for (var i = 0; i < that.queues[j].allNpcs.length; i++) {
                                    var npc = that.queues[j].allNpcs[i];
                                    that.moveNpcOffScreen(npc, count, that);
                                    count++;
                                }
                            }

                            //move cops out
                            for (var j = 0; j < that.cops.length; j++) {
                                var cop = that.cops[j];
                                that.moveNpcOffScreen(cop, count, that);
                                count++;
                            }

                            that.endgameNpcsOnScreenCount = count;

                            //move cashiers to the corners
                            for (var j = 0; j < that.queues.length; j++) {
                                var cashier = that.queues[j].cashier;
                                cashier.avatar.gotoAndPlay('scared');
                                cashier.movementDestination = constants.CORNERS[j];
                                cashier.shouldMove = true;
                            }
                        });
                        that.robber.finishedMoving.remove(sayStickup);
                        setTimeout(function() {
                            that.robber.movementDestination = { row: 5, col: 9 };
                            that.robber.shouldMove = true;
                            that.robber.finishedMoving.add(function continueConversation() {
                                that.robber.finishedMoving.remove(continueConversation);
                                that.continueEndGameWithRobber.apply(that);
                            });

                        },7000);
                    });
                    
                    //hide UI elements
                    that.timeLabel.alpha = 0;
                    that.bag.alpha = 0;
                    that.itemCountLabel.alpha = 0;
                }, 3000);

            },
            moveNpcOffScreen:function(npc, count, that) {
                npc.avatar.gotoAndPlay('scared');
                npc.ignorePlayerWhenMoving = true;
                npc.movementSpeed = (2 * npc.movementSpeed) / 3; //speed things up
                npc.movementDestination = { row: constants.ENTRY_ROWS[count % constants.ENTRY_ROWS.length], col: -1 };
                npc.finishedMoving.add(function (n) {
                    that.gameWorld.removeChild(n.view);
                    tileManager.collisionMap[n.row][n.col] = false;
                    that.endgameNpcsOnScreenCount--;
                });
                npc.shouldMove = true;
            },
            continueEndGameWithRobber: function () {
                var that = this;
                this.robber.say(text.getRobberText(text.robber.afterEveryoneLeaves, that.endGameRetries)[0], 5000, function () {
                    that.robber.say(text.getRobberText(text.robber.afterEveryoneLeaves, that.endGameRetries)[1], 6000, function () {
                        that.robber.say(text.getRobberText(text.robber.afterEveryoneLeaves, that.endGameRetries)[2], 6000, function () {
                            createjs.Tween.get(that.movieBlocks).to({ alpha: 0 }, 500, createjs.Ease.quadIn).call(function () {
                                that.isInEndgameCutscene = false;
                                var count = 0;
                                that.player.moved.add(function tookStep() {
                                    count++;
                                    if (count < 4) {
                                        that.isInEndgameCutscene = true;
                                        var msg = '';
                                        if (count === 1)
                                            msg = text.getRobberText(text.robber.provoked, that.endGameRetries)[0];
                                        else if (count === 2)
                                            msg = text.getRobberText(text.robber.provoked, that.endGameRetries)[1];
                                        else {
                                            msg = text.getRobberText(text.robber.provoked, that.endGameRetries)[2];
                                        }
                                        createjs.Tween.get(that.movieBlocks).to({ alpha: 1 }, 500, createjs.Ease.quadIn);
                                        that.robber.say(msg, 3000, function () {
                                            createjs.Tween.get(that.movieBlocks).to({ alpha: 0 }, 500, createjs.Ease.quadIn);
                                            that.isInEndgameCutscene = false;
                                            if (count === 3) {
                                                that.player.moved.remove(tookStep);
                                                createjs.Tween.get(that.robberHitPointsIcons).to({ alpha: 1 }, 300, createjs.Ease.quadIn);
                                                that.startBossFight.apply(that);
                                            }
                                        });
                                    }
                                });
                            });
                        });

                    });

                });
            },
            startBossFight: function () {
                var that = this;
                
                this.robber.kill(this.player);
                this.robber.died.add(function () {
                    assetManager.playMusic('win',0.3);
                    createjs.Tween.get(that.movieBlocks).to({ alpha: 1 }, 500, createjs.Ease.quadIn);
                    that.isInEndgameCutscene = true;
                    //pick cashier
                    var cashier = that.player.row > 5 ? that.queues[1].cashier : that.queues[0].cashier;
                    cashier.movementDestination = { row: that.player.row, col: that.player.col >= 13 ? that.player.col - 1 : that.player.col + 1 };
                    cashier.shouldMove = true;
                    //create a bigger speech bubbles
                    cashier.createSpeechBubble(constants.TILE_SIZE * 2, constants.TILE_SIZE * 2, -constants.TILE_SIZE / 2, '13px', 15);
                    that.gameWorld.removeChild(cashier.view);
                    that.gameWorld.addChild(cashier.view);
                    cashier.sayingSomething.add(function (npc) {
                        that.npcInDialog = npc;
                    });
                    cashier.finishedMoving.add(function () {
                        that.cashierEndDialog.apply(that,[cashier,0]);
                    });

                });
            },
            cashierEndDialog: function (cashier, index) {
                var that = this;
                cashier.say(text.cashierEndTexts[index], 3000, function () {
                    index++;
                    if (index < text.cashierEndTexts.length) {
                        that.cashierEndDialog.apply(that, [cashier, index]);
                        if(index == text.cashierEndTexts.length - 1)
                            assetManager.stopMusic();
                    } else {
                        that.zoomInterval = setInterval(function() {
                            that.endZoomIn.apply(that);
                        }, 1000);
                    }
                },true);
            },
            endZoomIn: function () {
                var that = this;
                assetManager.playSound('thud');
                if (this.zoomIteration === 6) { //cut to black, go to main menu
                    clearInterval(this.zoomInterval);
                    this.gameWorld.alpha = 0;
                    setTimeout(function () {
                        that.needsReset = true;
                        that.goToMainMenuScreen.fire();
                        analytics.track('Finished Game');
                    }, 1000);
                }
                if (this.zoomIteration === 0) {
                    this.player.avatar.gotoAndPlay('still');
                }
                this.gameWorld.regX = this.getZoomRegX(this.zoomIteration);
                this.gameWorld.regY = this.getZoomRegY(this.zoomIteration);
                this.gameWorld.scaleX = this.gameWorld.scaleY = this.gameWorld.scaleY * 2;
                this.zoomIteration++;

            },
            getZoomRegY: function (iteration) {
                if (iteration === 0)
                    return this.player.view.y - 110;
                else if(iteration === 1)
                    return this.player.view.y - 45;
                else if(iteration === 2)
                    return this.player.view.y - 13;
                else if(iteration === 3)
                    return this.player.view.y +3;
                else if(iteration === 4)
                    return this.player.view.y + 12;
                else if (iteration === 5)
                    return this.player.view.y +15;
            },
            getZoomRegX: function (iteration) {
                if (iteration === 0)
                    return this.player.view.x-160;
                else if(iteration === 1)
                    return this.player.view.x -70;
                else if(iteration === 2)
                    return this.player.view.x -23;
                else if (iteration === 3)
                    return this.player.view.x + 1;
                else if(iteration === 4)
                    return this.player.view.x + 13;
                else if (iteration === 5)
                    return this.player.view.x + 19;
            }
            
            
        });
    });
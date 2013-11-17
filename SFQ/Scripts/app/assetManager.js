define('assetManager',
    ['createjs'], function (createjs) {
        var images = {},
            queue,
            progressChangedEvent = $.Callbacks(),
            loadCompleteEvent = $.Callbacks(),
            manifest = [
                //images
                { src: "/Content/Images/oryx_creatures.png", id: "creatures" },
                { src: "/Content/Images/bg.png", id: "bg" },
                { src: "/Content/Images/table.png", id: "table" },
                { src: "/Content/Images/cashier.png", id: "cashier" },
                { src: "/Content/Images/oryx_items.png", id: "items" },
                { src: "/Content/Images/cash_register.png", id: "cashRegister" }, //TODO:  FatCow Web Hosting - http://www.fatcow.com/ 


                //sounds
                { src: "/Content/Sounds/walk.mp3|/Content/Sounds/walk.ogg", id: 'walk' },
                //{ src: "/Content/Sounds/beep.mp3|/Content/Sounds/beep.ogg", id: 'beep' },
                //{ src: "/Content/Sounds/supermarket.mp3|/Content/Sounds/supermarke t.ogg", id: 'supermarket' },
                //{ src: "/Content/Sounds/bossa.mp3|/Content/Sounds/bossa.ogg", id: 'bossa' },
            ],
            loadAssets = function () {
                queue = new createjs.LoadQueue();
                queue.installPlugin(createjs.Sound);
                queue.addEventListener("complete", handleComplete);
                queue.addEventListener("fileload", handleFileLoad);
                queue.addEventListener("progress", handleProgress);
                queue.loadManifest(manifest);
            },
            handleFileLoad = function (o) {
                //You could store all your images in object to call them easily.  
                if (o.item.type === "image") {
                    images[o.item.id] = o.result;

                }
            },
            handleProgress = function (event) {
                progressChangedEvent.fireWith(window, [event.progress]);
            },
            handleComplete = function (event) {
                loadCompleteEvent.fire();
            },

        //sound stuff
        isMuted = false,
            playSound = function (id, volume, loop) {
                volume = volume || 1;
                var sound = createjs.Sound.play(id, createjs.Sound.INTERRUPT_NONE,0,0,loop? -1 : 0,volume );
            },
            toggleMute = function () {
                isMuted = !isMuted;
                createjs.Sound.setMute(isMuted);
            };

        return {
            loadAssets: loadAssets,
            progressChangedEvent: progressChangedEvent,
            loadCompleteEvent: loadCompleteEvent,
            images: images,
            playSound: playSound,
            toggleMute: toggleMute
        };
    });
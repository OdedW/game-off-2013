define('assetManager',
    ['createjs'], function (createjs) {
        var images = {},
            queue,
            progressChangedEvent = $.Callbacks(),
            loadCompleteEvent = $.Callbacks(),
            sounds = {
            },
            manifest = [
                //images
                //{ src: "/Content/Images/background1.jpg", id: "background1" },

                //sounds
                //{ src: "/Content/Sounds/Jump.wav", id: sounds.jump },
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
                if (o.item.type == "image") {
                    images[o.item.id] = o.result;

                }
            },
            handleProgress = function (event) {
                progressChangedEvent.fireWith(window, [event.progress]);
            },
            handleComplete = function (event) {
                loadCompleteEvent.fire();
            },
        snapValue = function (value, snap) {
            var roundedSnap = (value / snap + (value > 0 ? .5 : -.5)) | 0;
            return roundedSnap * snap;
        },
            playSound = function (id) {
                createjs.Sound.play(id);
            };

        return {
            loadAssets: loadAssets,
            progressChangedEvent: progressChangedEvent,
            loadCompleteEvent: loadCompleteEvent,
            images: images,
            playSound: playSound,
            sounds: sounds
        };
    });
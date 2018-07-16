cc.Class({
    extends: cc.Component,

    properties: {
        sceneName: '',
    },

    start() {
        // it will trigger cross-origin exception when in FB frame
        try { var inFB = !window.parent.location.href; }
        catch (e) { inFB = true; }

        if (inFB) {
            if (typeof FBInstant !== 'undefined') {
                this.loadScene()
            } else {
                this.appendScriptAsync()
                    .then(() => this.initialFBAsync())
                    .then(() => this.loadScene());
            }
        } else {
            this.loadScene();
        }
    },

    appendScriptAsync() {
        return new Promise((resolve, reject) => {
            var a = document.createElement("script");
            a.setAttribute("type", "application/javascript");
            a.setAttribute("src", "https://connect.facebook.net/en_US/fbinstant.6.2.js");

            document.getElementsByTagName("head")[0].appendChild(a);

            var done = false;
            a.onload = a.onreadystatechange = function () {
                if (!done && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete")) {
                    done = true;

                    // FBInstantWrapper 是plugin 所以比較早執行, 這邊要把他回寫回去
                    // if (typeof FBInstantWrapper !== 'undefined') {
                    //     FBInstantWrapper = window.FBInstant;
                    // }

                    resolve();
                }
            };
        });
    },

    initialFBAsync() {
        return FBInstant.initializeAsync()
            .then(_ => {
                FBInstant.setLoadingProgress(100)
                return FBInstant.startGameAsync()
            })
            .catch(e => cc.error(e));
    },

    loadScene() {
        cc.director.loadScene(this.sceneName);
    }
});

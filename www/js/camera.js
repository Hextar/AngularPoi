angular.module('angular-poi')

    .factory('Camera', function ($rootScope, $ionicPlatform) {

        return {

            initBackCamera: function () {
                $ionicPlatform.ready(function () {
                    if (window.StatusBar) {
                        StatusBar.styleDefault();
                    }
                    if (window.ezar) {
                        ezar.initializeVideoOverlay(
                            function () {
                                //window.AndroidFullScreen.immersiveMode();
                                ezar.getBackCamera().start();
                            },
                            function (err) {
                                alert('unable to init ezar: ' + err);
                            }
                        );
                    }
                });
            }
        };
    });
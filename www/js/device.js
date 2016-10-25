/*** ********** ***/
/*** Compass.js ***/
/*** ********** ***/
(function () {
    'use strict';

    angular
        .module('angular-poi')
        .factory('Compass', compass);

    compass.$inject = ['$rootScope', '$ionicPlatform', '$cordovaDeviceOrientation'];

    function compass($rootScope, $ionicPlatform, $cordovaDeviceOrientation) {

        this.options = {
            frequency: 100
        };

        var directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW', 'N'];

        this.watch = undefined;

        this.init = function () {
            $rootScope.compass = {
                direction: undefined,
                magneticHeading: undefined,
                trueHeading: undefined,
                accuracy: undefined,
                timestamp: undefined
            }
        };

        this.getCurrentHeading = function () {
            if (!angular.isDefined($rootScope.compass)) {
                this.init();
            }
            $ionicPlatform.ready(function () {
                $cordovaDeviceOrientation.getCurrentHeading()
                    .then(function (result) {
                        $rootScope.compass.direction = directions[Math.abs(parseInt((result.magneticHeading) / 45) + 1)];
                        $rootScope.compass.magneticHeading = result.magneticHeading;
                        $rootScope.compass.trueHeading = result.trueHeading;
                        $rootScope.compass.accuracy = result.headingAccuracy;
                        $rootScope.compass.timeStamp = result.timestamp;

                        if ($rootScope.dataLoading != "loading") $rootScope.calculateDirection(result.magneticHeading);
                    }, function (err) {
                        $rootScope.errorList += err + " - ";
                    });
            });
        };

        this.watchHeading = function () {
            var option = this.options;
            var compass = this;
            if (!angular.isDefined($rootScope.compass)) {
                this.init();
            }
            $ionicPlatform.ready(function () {
                compass.watch = $cordovaDeviceOrientation.watchHeading(option)
                    .then(
                        null,
                        function (err) {
                            $rootScope.errorList += err + " - ";
                        },
                        function (result) {   // updates constantly (depending on frequency value)
                            $rootScope.compass.direction = directions[Math.abs(parseInt((result.magneticHeading) / 45) + 1)];
                            $rootScope.compass.magneticHeading = result.magneticHeading;
                            $rootScope.compass.trueHeading = result.trueHeading;
                            $rootScope.compass.accuracy = result.headingAccuracy;
                            $rootScope.compass.timeStamp = result.timestamp;

                            if ($rootScope.dataLoading != "loading") {
                                $rootScope.calculateDirection(result.magneticHeading);
                            }

                            //console.info("Compass: " + $rootScope.compass.direction);
                        });
            });
        };

        this.clearWatch = function () {
            if (angular.isDefined(this.watch)) {
                this.watch.clearWatch();
            }
        };

        return this;
    }

})();

/*** ***************** ***/
/*** Accellerometer.js ***/
/*** ***************** ***/
(function () {
    'use strict';

    angular
        .module('angular-poi')
        .factory('Accellerometer', accellerometer);

    accellerometer.$inject = ['$rootScope', '$ionicPlatform', '$cordovaDeviceMotion'];

    function accellerometer($rootScope, $ionicPlatform, $cordovaDeviceMotion) {

        this.options = {
            frequency: 100
        };

        this.watch = undefined;

        this.init = function () {
            $rootScope.motion = {
                x: undefined,
                y: undefined,
                z: undefined
            }
        };

        this.getCurrentAcceletation = function () {
            if (!angular.isDefined($rootScope.motion)) {
                this.init();
            }
            $ionicPlatform.ready(function () {
                $cordovaDeviceMotion.getCurrentAcceleration()
                    .then(function (result) {
                        $rootScope.motion.x = result.x;
                        $rootScope.motion.y = result.y;
                        $rootScope.motion.z = result.z;
                        if (result.y > 7) $rootScope.showTop();
                        else $rootScope.hideTop();
                    }, function (err) {
                        $rootScope.errorList += err + " - ";
                    });
            });
        };

        this.watchAcceleration = function () {
            var option = this.options;
            var motion = this;
            if (!angular.isDefined($rootScope.motion)) {
                this.init();
            }
            $ionicPlatform.ready(function () {
                motion.watch = $cordovaDeviceMotion.watchAcceleration(option)
                    .then(
                        null,
                        function (err) {
                            $rootScope.errorList += err + " - ";
                        },
                        function (result) {   // updates constantly (depending on frequency value)
                            $rootScope.motion.x = result.x;
                            $rootScope.motion.y = result.y;
                            $rootScope.motion.z = result.z;
                            if (result.y > 7) $rootScope.showTop();
                            else $rootScope.hideTop();
                            //console.info("Accelleration: " + result.x + "-" + result.y + "-" + result.z);
                        });
            });
        };

        this.clearWatch = function () {
            if (angular.isDefined(this.watch)) {
                this.watch.clearWatch();
            }
        };

        return this;
    }

})();

/*** ************** ***/
/*** Geolocation.js ***/
/*** ************** ***/
(function () {
    'use strict';

    angular
        .module('angular-poi')
        .factory('Geolocation', geolocation);

    geolocation.$inject = ['$rootScope', '$filter', '$ionicPlatform', '$ionicPopup', '$cordovaGeolocation'];

    function geolocation($rootScope, $filter, $ionicPlatform, $ionicPopup, $cordovaGeolocation) {

        var asking = false;

        this.options = {
            timeout: 2 * 10000,
            maximumAge: 0,
            enableHighAccuracy: true
        };

        this.watch = undefined;

        this.init = function () {
            $rootScope.geo = {
                lat: undefined,
                lon: undefined
            }
        };

        this.getCurrentPosition = function () {
            if (!angular.isDefined($rootScope.geo)) {
                this.init();
            }
            var posOptions = this.option;
            $ionicPlatform.ready(function () {
                $cordovaGeolocation.getCurrentPosition(posOptions)
                    .then(function (position) {
                        $rootScope.geo.lat = position.coords.latitude;
                        $rootScope.geo.lon = position.coords.longitude;
                        if (!$rootScope.dataLoading) $rootScope.loadData();
                    }, function (err) {
                        $rootScope.errorList += err + " - ";
                        if(err.code != 3) {
                            if(!asking) {
                                asking = true;
                                gpsAlert();
                            }
                        }
                    });
            });
        };

        this.watchPosition = function () {
            var watchOptions = this.options;
            var position = this;
            if (!angular.isDefined($rootScope.geo)) {
                this.init();
            }
            $ionicPlatform.ready(function () {
                position.watch = $cordovaGeolocation.watchPosition(watchOptions)
                    .then(
                        null,
                        function (err) {
                            $rootScope.errorList += err + " - ";
                            console.info(err);
                        },
                        function (geo) {
                            $rootScope.geo.lat = geo.coords.latitude;
                            $rootScope.geo.lon = geo.coords.longitude;
                            if (!$rootScope.dataLoading) {
                                $rootScope.loadData();
                            }
                            //console.info("Geolocation: " + $rootScope.geo.lat + "-" + $rootScope.geo.lon);
                        });
            });

        };

        this.clearWatch = function () {
            if (angular.isDefined(this.watch)) {
                this.watch.clearWatch();
            }
        };

        return this;

       function gpsAlert() {
            var confirmPopup = $ionicPopup.confirm({
                title: $filter("translate")("ar.popup.title"),
                template: $filter("translate")("ar.popup.text"),
                okText: $filter("translate")("ar.popup.button")
            });
           if(!asking) {
               confirmPopup.then(function (res) {
                   if (res) {
                       cordova.plugins.diagnostic.switchToLocationSettings();
                   }
                   asking = false;
               });
           }
        }
    }

})();
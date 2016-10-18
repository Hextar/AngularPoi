angular.module('angular-poi')

    .factory('Compass', function ($rootScope, $ionicPlatform, $cordovaDeviceOrientation) {

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

                        if (dataLoading != "loading") $rootScope.calculateDirection(result.magneticHeading);
                    }, function (err) {
                        $rootScope.errorList += err+" - ";
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
                            $rootScope.errorList += err+" - ";
                        },
                        function (result) {   // updates constantly (depending on frequency value)
                            $rootScope.compass.direction = directions[Math.abs(parseInt((result.magneticHeading) / 45) + 1)];
                            $rootScope.compass.magneticHeading = result.magneticHeading;
                            $rootScope.compass.trueHeading = result.trueHeading;
                            $rootScope.compass.accuracy = result.headingAccuracy;
                            $rootScope.compass.timeStamp = result.timestamp;

                            if (dataLoading != "loading") $rootScope.calculateDirection(result.magneticHeading);

                            console.info("Compass: "+result.direction);
                        });
            });
        };

        this.clearWatch = function () {
            if (angular.isDefined(this.watch)) {
                this.watch.clearWatch();
            }
        };

        return this;
    })

    .factory('Accellerometer', function ($rootScope, $ionicPlatform, $cordovaDeviceMotion) {

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
                        if (motion.y > 7) $rootScope.showTop();
                        else $rootScope.hideTop();
                    }, function (err) {
                        $rootScope.errorList += err+" - ";
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
                            $rootScope.errorList += err+" - ";
                        },
                        function (result) {   // updates constantly (depending on frequency value)
                            $rootScope.motion.x = result.x;
                            $rootScope.motion.y = result.y;
                            $rootScope.motion.z = result.z;
                            if (motion.y > 7) $rootScope.showTop();
                            else $rootScope.hideTop();
                            console.info("Accelleration: "+motion.x+"-"+motion.y+"-"+motion.z);
                        });
            });
        };

        this.clearWatch = function () {
            if (angular.isDefined(this.watch)) {
                this.watch.clearWatch();
            }
        };

        return this;
    })

    .factory('Geolocation', function ($rootScope, $ionicPlatform, $cordovaGeolocation) {

        this.options = {
            timeout: 3000,
            enableHighAccuracy: false
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
                $cordovaGeolocation
                    .getCurrentPosition(posOptions)
                    .then(function (position) {
                        $rootScope.geo.lat = position.coords.latitude;
                        $rootScope.geo.lon = position.coords.longitude;
                        if(!$rootScope.dataLoading) $rootScope.loadData();
                    }, function (err) {
                        $rootScope.errorList += err+" - ";
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
                            $rootScope.errorList += err+" - ";
                        },
                        function (geo) {
                            $rootScope.geo.lat = geo.coords.latitude;
                            $rootScope.geo.lon = geo.coords.longitude;
                            if(!$rootScope.dataLoading) $rootScope.loadData();
                            console.info("Geolocation: "+geo.lat+"-"+geo.lon);
                        });
            });
        };

        this.clearWatch = function () {
            if (angular.isDefined(this.watch)) {
                this.watch.clearWatch();
            }
        };

        return this;
    });


/*** ********* ***/
/*** Controller.js ***/
/*** ********* ***/
(function () {
    'use strict';

    angular
        .module('angular-poi', ['templates'])
        .controller("CameraController", cameraController);

    cameraController.$inject = ['$scope', '$sce', '$rootScope', '$ionicPlatform',
        'Compass', 'Accellerometer', 'Geolocation', 'Camera'];

    function cameraController($scope, $sce, $rootScope, $ionicPlatform, Compass, Accellerometer,
                              Geolocation, Camera) {

        var pois = $scope.pois;

        var DISTANCE_THRESHOLD_1 = 5;
        var DISTANCE_THRESHOLD_2 = 10;
        var DISTANCE_THRESHOLD_3 = 20;
        $scope.POI_LIMIT = 3;

        var markersArray = [], bounds;
        var bearing, distance;
        $rootScope.dataLoading = false;
        $scope.arViewVisible = false;
        $scope.viewViewVisible = false;
        $scope.poiList = [];


        function drawAR() {
            $ionicPlatform.ready(function () {

                Camera.initBackCamera();

                //setupMap();

                Compass.getCurrentHeading();
                Accellerometer.getCurrentAcceletation();
                Geolocation.getCurrentPosition();

                Compass.watchHeading();
                Accellerometer.watchAcceleration();
                Geolocation.watchPosition();

                if ($rootScope.errorList != undefined) {
                    console.error($rootScope.errorList);
                }
            });

        }

        (function () {
            $scope.$watch('pois', function (newVal) {
                if ($scope.pois !== undefined) {
                    pois = newVal;
                    console.debug(newVal);
                    drawAR();
                }
            }, true);
        }());

        // setup google maps api
        function setupMap() {
            $("#map").height($(window).height() - 60);
            var mapOptions = {
                zoom: 13,
                mapTypeControl: false,
                streetViewControl: false,
                navigationControl: true,
                scrollwheel: false,
                navigationControlOptions: {style: google.maps.NavigationControlStyle.SMALL},
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            map = new google.maps.Map(document.getElementById("map"), mapOptions);
        }

        // get data from API and store in array, add to list view and create markers on map, calculate
        $rootScope.loadData = function () {
            $rootScope.dataLoading = true;

            /*
             markersArray = [];
             bounds = new google.maps.LatLngBounds();
             var icon = new google.maps.MarkerImage('http://www.google.com/intl/en_us/mapfiles/ms/micons/blue-dot.png',new google.maps.Size(30, 28),new google.maps.Point(0,0),new google.maps.Point(9, 28));
             var gpsMarker = new google.maps.Marker({position: new google.maps.LatLng($rootScope.geo.lat, $rootScope.geo.lon), map: map, title: "My Position", icon:icon});
             bounds.extend(new google.maps.LatLng($rootScope.geo.lat, $rootScope.geo.lon));
             markersArray.push(gpsMarker);*/

            $scope.poiList = [];
            for (var i = 0; i < pois.length; i++) {
                //addMarker(i);
                $scope.poiList.push(pois[i]);
                relativePosition(i);
            }

            /*
             map.fitBounds(bounds);
             google.maps.event.trigger(map, "resize");
             */
            $rootScope.dataLoading = false;
        }

        // add marker to map and in array
        function addMarker(i) {
            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(pois[i].lat, pois[i].lng),
                map: map,
                title: pois[i].name
            });
            bounds.extend(new google.maps.LatLng(pois[i].lat, pois[i].lng));
            markersArray.push(marker);
        }

        // calulate distance and bearing value for each of the points wrt gps lat/lng
        function relativePosition(i) {
            var EARTH_RADISU_KM = 6371.0072;
            var poiLat = pois[i].lat;
            var poiLng = pois[i].lng;
            var dLat = ($rootScope.geo.lat - poiLat) * Math.PI / 180;
            var dLon = ($rootScope.geo.lon - poiLng) * Math.PI / 180;
            var lat1 = poiLat * Math.PI / 180;
            var lat2 = $rootScope.geo.lat * Math.PI / 180;
            var y = Math.sin(dLon) * Math.cos(lat2);
            var x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
            bearing = Math.atan2(y, x) * 180 / Math.PI;
            bearing = bearing + 180;
            pois[i]['bearing'] = bearing;
            var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            distance = EARTH_RADISU_KM * c;
            pois[i]['distance'] = distance;
        }

        // calculate direction of points and display
        $rootScope.calculateDirection = function (degree) {
            var detected = 0;
            var poiList = [];
            $scope.computedPois = poiList;
            for (var i = 0; i < pois.length; i++) {
                if (Math.abs(pois[i].bearing - degree) <= 20) {
                    var away, fontSize, fontColor;
                    // vary font size based on distance from gps location
                    if (pois[i].distance > DISTANCE_THRESHOLD_3) {
                        away = Math.round(pois[i].distance);
                        fontSize = "16";
                        fontColor = "#ccc";
                    } else if (pois[i].distance > DISTANCE_THRESHOLD_2) {
                        away = Math.round(pois[i].distance);
                        fontSize = "24";
                        fontColor = "#ddd";
                    } else {
                        away = pois[i].distance.toFixed(2);
                        fontSize = "30";
                        fontColor = "#eee";
                    }
                    poiList.push('<div class="name" data-id="' + i + '" style="margin-left:' + (((pois[i].bearing - degree) * 5) + 50) + 'px;width:' + ($(window).width() - 100) + 'px;font-size:' + fontSize + 'px;color:' + fontColor + '">' + pois[i].name + '<div class="distance">' + away + ' kilometers away</div></div>');
                    //console.debug(poiList);
                    $scope.computedPois = $sce.trustAsHtml(poiList.toString());
                    detected = 1;
                } else {
                    if (!detected) {
                        poiList = [];
                        $scope.computedPois = $sce.trustAsHtml();
                    }
                }
            }
        }

        $rootScope.showTop = function () {
            $scope.arViewVisible = true;
            $scope.topViewVisible = false;
        }

        $rootScope.hideTop = function () {
            $scope.topViewVisible = true;
            $scope.arViewVisible = false;
        }

    }

})();

/*** ********* ***/
/*** Directive.js ***/
/*** ********* ***/
(function () {
    'use strict';

    angular
        .module('angular-poi')
        .directive('angularPoi', directive);

    function directive() {
        return {
            restrict: 'AE',
            scope: {pois: '=pois'},
            templateUrl: "templates/cameraAR.html",
            controller: 'CameraController'
        };
    }

})();


/*** ********* ***/
/*** Template.js ***/
/*** ********* ***/
angular.module("templates", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("templates/cameraAR.html", "<ion-pane id='camera-view' class='no-background'> <div id='arView' class='no-background' ng-if='arViewVisible'> <div class='arMessage'>&uarr;<br>Tilt down to see all places</div><br><div class='arMessage'>&larr; Move the device around to find spots &rarr;</div><br><div id='direction'>{{$root.compass.direction}}</div><br><div id='spot'> <div ng-bind-html='computedPois'></div></div></div><div id='topView' ng-if='topViewVisible'> <div class='navbar'> <div class='navtitle'>Nearby</div></div><ul class='list'> <li class='item' ng-repeat='poi in poiList track by $index | limitTo POI_LIMIT'>{{poi.name}}</li></ul> <div class='mapView'> <div id='map'></div></div></div><div id='debug'> <div class='heading'>Geolocation</div><div id='geolocation'></div>LAT:{{$root.geo.lat}}LON:{{$root.geo.lon}}<div class='heading'>Compass</div><div id='compass'></div>DIRECTION:{{$root.compass.direction}}<div class='heading'>Accelerometer</div><div id='accelerometer'> X:{{$root.motion.x}}Y:{{$root.motion.y}}Z:{{$root.motion.z}}</div><div class='heading'>Log</div><div id='log'></div>ERRORI:{{$root.errorList}}</div></ion-pane>");
}]);


/*** ********* ***/
/*** Camera.js ***/
/*** ********* ***/
(function () {
    'use strict';

    angular
        .module('angular-poi')
        .factory('Camera', camera);

    camera.$inject = ['$ionicPlatform'];

    function camera($ionicPlatform) {
        return {

            initBackCamera: function () {
                $ionicPlatform.ready(function () {
                    if (window.StatusBar) {
                        StatusBar.styleDefault();
                    }
                    if (window.ezar) {
                        ezar.initializeVideoOverlay(
                            function () {
                                window.AndroidFullScreen.immersiveMode();
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
    }

})();


/*** ********** ***/
/*** Compass.js ***/
/*** ********** ***/
(function () {
    'use strict';

    angular
        .module('angular-poi')
        .factory('Compass', compass);

    compass.$inject = ['$rootScope', '$cordovaDeviceOrientation'];

    function compass($rootScope, $cordovaDeviceOrientation) {

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
        };

        this.watchHeading = function () {
            var option = this.options;
            var compass = this;
            if (!angular.isDefined($rootScope.compass)) {
                this.init();
            }
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

    accellerometer.$inject = ['$rootScope', '$cordovaDeviceMotion'];

    function accellerometer($rootScope, $cordovaDeviceMotion) {

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
        };

        this.watchAcceleration = function () {
            var option = this.options;
            var motion = this;
            if (!angular.isDefined($rootScope.motion)) {
                this.init();
            }
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
            timeout: 2 * 1000,
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
            confirmPopup.then(function (res) {
                if (res) {
                    cordova.plugins.diagnostic.switchToLocationSettings();
                    asking = false;
                }
            });

        }
    }

})();
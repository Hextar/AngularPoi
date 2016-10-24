(function () {
    'use strict';

    angular
        .module('angular-poi')
        .controller("CameraController", cameraController);

    cameraController.$inject = ['$scope', '$sce', '$rootScope', '$ionicPlatform',
        'Compass', 'Accellerometer', 'Geolocation', 'Camera'];

    function cameraController($scope, $sce, $rootScope, $ionicPlatform, Compass, Accellerometer,
                              Geolocation, Camera) {

        var pois = $scope.pois;

        var DISTANCE_THRESHOLD_1 = 5;
        var DISTANCE_THRESHOLD_2 = 10;
        var DISTANCE_THRESHOLD_3 = 20;

        var markersArray = [], bounds;
        var bearing, distance;
        $rootScope.dataLoading = false;
        $scope.arViewVisible = false;
        $scope.viewViewVisible = false;
        $scope.poiList = [];

        function drawAR() {
            $ionicPlatform.ready(function () {
                console.debug("STARTED DOING SHIET");

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
                    console.debug("POIS RECEIVED");
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
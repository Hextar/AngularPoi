angular.module('angular-poi')

    .controller("CameraController", function ($scope, $state, $rootScope, $ionicPlatform, $timeout,
                                              Compass, Motion, Location, Camera, $log) {

        var pin = [
            {"name": "Coccodì", "lat": "39.218365", "lng": "9.113795"},
            {"name": "Bombas", "lat": "39.217118", "lng": "9.115308"},
            {"name": "La Balena", "lat": "39.231314", "lng": "9.094558"},
            {"name": "Pizzeria Levante", "lat": "39.228395", "lng": "9.120056"},
            {"name": "Pizzeria Nicolino", "lat": "39.234539", "lng": "9.100404"}
        ];

        var markersArray = [], bounds;
        var myLat = 0, myLng = 0;
        var bearing, distance;
        var dataStatus = 0;

        window.ionic.Platform.ready(function () {

            console.debug("Body ready");

            window.AndroidFullScreen.immersiveMode();

            startCamera();

            setupMap();

            // start cordova device sensors
            startAccelerometer();
            startCompass();
            startGeolocation();
        });

        // start ezar camera
        function startCamera() {
            ezar.initializeVideoOverlay(
                function() {
                    ezar.getBackCamera().start();
                },
                function(error) {
                    console.error("ezar initialization failed");
                });
        }

        // setup google maps api
        function setupMap(){
            $("#map").height($(window).height()-60);
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

        // toggle between list view and map view
        function toggleView(){
            if($(".listView").is(":visible")){
                $(".listView").hide();
                $("#map").height($(window).height()-60);
                $(".mapView").fadeIn(
                    function(){
                        google.maps.event.trigger(map, "resize");
                        map.fitBounds(bounds);});
                $("#viewbtn").html("List");
            } else {
                $(".mapView").hide();
                $(".listView").fadeIn();
                $("#viewbtn").html("Map");
            }
        }

        // get data from API and store in array, add to list view and create markers on map, calculate
        function loadData(){
            dataStatus = "loading";
            markersArray = [];
            bounds = new google.maps.LatLngBounds();
            // add blue gps marker
            var icon = new google.maps.MarkerImage('http://www.google.com/intl/en_us/mapfiles/ms/micons/blue-dot.png',new google.maps.Size(30, 28),new google.maps.Point(0,0),new google.maps.Point(9, 28));
            var gpsMarker = new google.maps.Marker({position: new google.maps.LatLng(myLat, myLng), map: map, title: "My Position", icon:icon});
            bounds.extend(new google.maps.LatLng(myLat, myLng));
            markersArray.push(gpsMarker);
            // add all location markers to map and list view and array
            for(var i=0; i< pin.length; i++){
                $(".listItems").append("<div class='item'>"+pin[i].name+"</div>");
                addMarker(i);
                relativePosition(i);
            }
            map.fitBounds(bounds);
            google.maps.event.trigger(map, "resize");
            dataStatus = "loaded";
        }

        // add marker to map and in array
        function addMarker(i) {
            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(pin[i].lat, pin[i].lng),
                map: map,
                title: pin[i].name
            });
            bounds.extend(new google.maps.LatLng(pin[i].lat, pin[i].lng));
            markersArray.push(marker);
        }

        // clear all markers from map and array
        function clearMarkers() {
            while (markersArray.length) {
                markersArray.pop().setMap(null);
            }
        }

        // calulate distance and bearing value for each of the points wrt gps lat/lng
        function relativePosition(i) {
            var pinLat = pin[i].lat;
            var pinLng = pin[i].lng;
            var dLat = (myLat - pinLat) * Math.PI / 180;
            var dLon = (myLng - pinLng) * Math.PI / 180;
            var lat1 = pinLat * Math.PI / 180;
            var lat2 = myLat * Math.PI / 180;
            var y = Math.sin(dLon) * Math.cos(lat2);
            var x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
            bearing = Math.atan2(y, x) * 180 / Math.PI;
            bearing = bearing + 180;
            pin[i]['bearing'] = bearing;

            var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            distance = 3958.76 * c;
            pin[i]['distance'] = distance;
        }

        // Start watching the geolocation
        function startGeolocation() {
            var options = {timeout: 30000};
            watchGeoID = navigator.geolocation.watchPosition(onGeoSuccess, onGeoError, options);
        }

        // Stop watching the geolocation
        function stopGeolocation() {
            if (watchGeoID) {
                navigator.geolocation.clearWatch(watchGeoID);
                watchGeoID = null;
            }
        }

        // onSuccess: Get the current location
        function onGeoSuccess(position) {
            document.getElementById('geolocation').innerHTML = 'Latitude: ' + position.coords.latitude + '<br />' + 'Longitude: ' + position.coords.longitude;
            myLat = position.coords.latitude;
            myLng = position.coords.longitude;
            if (!dataStatus) {
                loadData();
            }
        }

        // onError: Failed to get the location
        function onGeoError() {
            document.getElementById('log').innerHTML += "onError=.";
        }

        // Start watching the compass
        function startCompass() {
            var options = {frequency: 100};
            watchCompassID = navigator.compass.watchHeading(onCompassSuccess, onCompassError, options);
        }

        // Stop watching the compass
        function stopCompass() {
            if (watchCompassID) {
                navigator.compass.clearWatch(watchCompassID);
                watchCompassID = null;
            }
        }

        // onSuccess: Get the current heading
        function onCompassSuccess(heading) {
            var directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW', 'N'];
            var direction = directions[Math.abs(parseInt((heading.magneticHeading) / 45) + 1)];
            document.getElementById('compass').innerHTML = heading.magneticHeading + "<br>" + direction;
            document.getElementById('direction').innerHTML = direction;
            var degree = heading.magneticHeading;
            if ($("#arView").is(":visible") && dataStatus != "loading") {
                calculateDirection(degree);
            }
        }

        // onError: Failed to get the heading
        function onCompassError(compassError) {
            document.getElementById('log').innerHTML += "onError=." + compassError.code;
        }

        // Start checking the accelerometer
        function startAccelerometer() {
            var options = {frequency: 100};
            watchAccelerometerID = navigator.accelerometer.watchAcceleration(onAccelerometerSuccess, onAccelerometerError, options);
        }

        // Stop checking the accelerometer
        function stopAccelerometer() {
            if (watchAccelerometerID) {
                navigator.accelerometer.clearWatch(watchAccelerometerID);
                watchAccelerometerID = null;
            }
        }

        // onSuccess: Get current accelerometer values
        function onAccelerometerSuccess(acceleration) {
            // for debug purpose to print out accelerometer values
            var element = document.getElementById('accelerometer');
            element.innerHTML = 'Acceleration X: ' + acceleration.x + '<br />' +
                'Acceleration Y: ' + acceleration.y + '<br />' +
                'Acceleration Z: ' + acceleration.z;
            if (acceleration.y > 7) {
                $("#arView").fadeIn();
                $("#topView").hide();
                // document.getElementById('body').style.background = "#d22";
                document.getElementById('body').style.background = "transparent";
            } else {
                $("#arView").hide();
                $("#topView").fadeIn();
                document.getElementById('body').style.background = "#fff";
            }
        }

        // onError: Failed to get the acceleration
        function onAccelerometerError() {
            document.getElementById('log').innerHTML += "onError.";
        }

    });

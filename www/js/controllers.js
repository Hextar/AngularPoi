angular.module('angular-poi')

    .controller("CameraController", function ($scope, $state, $rootScope, $ionicPlatform, $timeout,
                                              Compass, Accellerometer, Geolocation, Camera) {

        var pin = [
            {"name": "Coccodì", "lat": "39.218365", "lng": "9.113795"},
            {"name": "Bombas", "lat": "39.217118", "lng": "9.115308"},
            {"name": "La Balena", "lat": "39.231314", "lng": "9.094558"},
            {"name": "Pizzeria Levante", "lat": "39.228395", "lng": "9.120056"},
            {"name": "Pizzeria Nicolino", "lat": "39.234539", "lng": "9.100404"}
        ];

        var markersArray = [], bounds;
        var bearing, distance;
        $rootScope.dataLoading = false;

        $ionicPlatform.ready(function () {

            Camera.initBackCamera();

            setupMap();

            Compass.getCurrentHeading();
            Accellerometer.getCurrentAcceletation();
            Geolocation.getCurrentPosition();

            Compass.watchHeading();
            Accellerometer.watchAcceleration();
            Geolocation.watchPosition();

            if($rootScope.errorList != "") console.error($rootScope.errorList);

        });


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

        // get data from API and store in array, add to list view and create markers on map, calculate
        $rootScope.loadData = function() {
            $rootScope.dataLoading = true;
            markersArray = [];
            bounds = new google.maps.LatLngBounds();
            // add blue gps marker
            var icon = new google.maps.MarkerImage('http://www.google.com/intl/en_us/mapfiles/ms/micons/blue-dot.png',new google.maps.Size(30, 28),new google.maps.Point(0,0),new google.maps.Point(9, 28));
            var gpsMarker = new google.maps.Marker({position: new google.maps.LatLng($rootScope.geo.lat, $rootScope.geo.lon), map: map, title: "My Position", icon:icon});
            bounds.extend(new google.maps.LatLng($rootScope.geo.lat, $rootScope.geo.lon));
            markersArray.push(gpsMarker);
            // add all location markers to map and list view and array
            for(var i=0; i< pin.length; i++){
                $(".listItems").append("<div class='item'>"+pin[i].name+"</div>");
                addMarker(i);
                relativePosition(i);
            }
            map.fitBounds(bounds);
            google.maps.event.trigger(map, "resize");
            $rootScope.dataLoading = false;
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

        // calulate distance and bearing value for each of the points wrt gps lat/lng
        relativePosition = function(i) {
            var EARTH_RADISU_KM = 6371.0072;
            var pinLat = pin[i].lat;
            var pinLng = pin[i].lng;
            var dLat = ($rootScope.geo.lat - pinLat) * Math.PI / 180;
            var dLon = ($rootScope.geo.lon - pinLng) * Math.PI / 180;
            var lat1 = pinLat * Math.PI / 180;
            var lat2 = $rootScope.geo.lat * Math.PI / 180;
            var y = Math.sin(dLon) * Math.cos(lat2);
            var x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
            bearing = Math.atan2(y, x) * 180 / Math.PI;
            bearing = bearing + 180;
            pin[i]['bearing'] = bearing;

            var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            distance = EARTH_RADISU_KM * c;
            pin[i]['distance'] = distance;
        }

        // calculate direction of points and display
        $rootScope.calculateDirection = function(degree){
            var detected = 0;
            $("#spot").html("");
            for(var i=0;i<pin.length;i++){
                if(Math.abs(pin[i].bearing - degree) <= 20){
                    var away, fontSize, fontColor;
                    // varry font size based on distance from gps location
                    if(pin[i].distance>1500){
                        away = Math.round(pin[i].distance);
                        fontSize = "16";
                        fontColor = "#ccc";
                    } else if(pin[i].distance>500){
                        away = Math.round(pin[i].distance);
                        fontSize = "24";
                        fontColor = "#ddd";
                    } else {
                        away = pin[i].distance.toFixed(2);
                        fontSize = "30";
                        fontColor = "#eee";
                    }
                    $("#spot").append('<div class="name" data-id="'+i+'" style="margin-left:'+(((pin[i].bearing - degree) * 5)+50)+'px;width:'+($(window).width()-100)+'px;font-size:'+fontSize+'px;color:'+fontColor+'">'+pin[i].name+'<div class="distance">'+ away +' kilometers away</div></div>');
                    detected = 1;
                } else {
                    if(!detected){
                        $("#spot").html("");
                    }
                }
            }

        }

        $rootScope.showTop = function() {
            $("#arView").fadeIn();
            $("#topView").hide();
        }

        $rootScope.hideTop = function() {
            $("#arView").fadeIn();
            $("#topView").hide();
        }

    });

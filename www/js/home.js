angular.module('angular-poi')

    .controller('Home', function ($scope, $rootScope, $ionicPlatform) {

        $ionicPlatform.ready(function () {
            cordova.plugins.diagnostic.requestRuntimePermissions(function (statuses) {
                for (var permission in statuses) {
                    switch (statuses[permission]) {
                        case cordova.plugins.diagnostic.permissionStatus.GRANTED:
                            console.log("Permission granted to use " + permission);
                            break;
                        case cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED:
                            console.log("Permission to use " + permission + " has not been requested yet");
                            break;
                        case cordova.plugins.diagnostic.permissionStatus.DENIED:
                            console.log("Permission denied to use " + permission + " - ask again?");
                            break;
                        case cordova.plugins.diagnostic.permissionStatus.DENIED_ALWAYS:
                            console.log("Permission permanently denied to use " + permission + " - guess we won't be using it then!");
                            break;
                    }
                }
            }, function (error) {
                console.error("The following error occurred: " + error);
            }, [
                cordova.plugins.diagnostic.permission.ACCESS_FINE_LOCATION,
                cordova.plugins.diagnostic.permission.ACCESS_COARSE_LOCATION,
                cordova.plugins.diagnostic.permission.CAMERA
            ]);
        });

        $scope.items = [
            {id: "111", "name": "Coccodì", "lat": "39.218365", "lng": "9.113795"},
            {id: "222", "name": "Bombas", "lat": "39.217118", "lng": "9.115308"},
            {id: "333", "name": "La Balena", "lat": "39.231314", "lng": "9.094558"},
            {id: "444", "name": "Pizzeria  Levante", "lat": "39.228395", "lng": "9.120056"},
            {id: "555", "name": "Pizzeria Nicolino", "lat": "39.234539", "lng": "9.100404"}
        ];

        $scope.listCallback = function (index) {
            console.debug("Cliccato object con id "+index);
        }

    });

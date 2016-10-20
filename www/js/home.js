angular.module('angular-poi')

    .controller('Home', function ($scope) {

        $scope.items = [
            {"name": "Coccodì", "lat": "39.218365", "lng": "9.113795"},
            {"name": "Bombas", "lat": "39.217118", "lng": "9.115308"},
            {"name": "La Balena", "lat": "39.231314", "lng": "9.094558"},
            {"name": "Pizzeria Levante", "lat": "39.228395", "lng": "9.120056"},
            {"name": "Pizzeria Nicolino", "lat": "39.234539", "lng": "9.100404"}
        ];

    });

(function () {
    'use strict';

    angular
        .module('angular-poi')
        .directive('angularPoi', directive);

    function directive() {
        return {
            restrict: 'AE',
            scope: {
                pois: '=pois',
                limit: '=limit',
                poiListCallback: '&'
            },
            templateUrl: "templates/cameraAR.html",
            controller: 'CameraController',
            link: function(scope, elm, attrs) {
            }
        };
    }

})();

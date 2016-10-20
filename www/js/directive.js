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

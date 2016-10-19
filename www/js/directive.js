(function () {
    'use strict';

    angular
        .module('angular-poi')
        .directive('angularPoi', directive);

    directive.$inject = [];

    function directive() {
        return {
            restrict: 'AE',
            templateUrl: "templates/camera.html",
            controller: 'CameraController'
        };
    }

})();

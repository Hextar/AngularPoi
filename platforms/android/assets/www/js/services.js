/**
 * Created by berserk on 05/08/16.
 */

angular.module('angular-poi')

    .factory('Camera', function ($rootScope, $ionicPlatform) {

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
        },

        reverseCamera: function () {
          //ignore ghost clicks, wait 1.5 sec between invocations
          var camera = ezar.getActiveCamera();
          if (!camera) {
            return; //no camera running; do nothing
          }
          var newCamera = camera;
          if (camera.getPosition() == "BACK" && ezar.hasFrontCamera()) {
            newCamera = ezar.getFrontCamera();
          } else if (camera.getPosition() == "FRONT" && ezar.hasBackCamera()) {
            newCamera = ezar.getBackCamera();
          }

          if (newCamera) {
            newCamera.start();
          }
        }
      };

    });
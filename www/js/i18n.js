angular.module('angular-poi')

    .config(function ($translateProvider) {

        itTranslate($translateProvider);

        enTranslate($translateProvider);

        $translateProvider.useSanitizeValueStrategy('escapeParameters');
        $translateProvider.preferredLanguage('IT');
    });

function itTranslate($translateProvider) {
    $translateProvider.translations('IT', {
        'home.label': "AngularPOI",
        'home.back': "Indietro",

        //// CAMERA
        "ar.title" : "&uarr; Inclina lo schermo per vedere tutti i punti di interesse",
        "ar.subtitle" : "&larr; Guardati attorno per trovare i punti di interesse &rarr;",
        "ar.popup.title" :"GPS non attivato",
        "ar.popup.text" : "Per la realtà aumentata occorre attivare il GPS",
        "ar.popup.button" : "Attiva",
        "ar.away" : "Km distante"
    });
}
function enTranslate($translateProvider) {
    $translateProvider.translations('EN', {
        'home.label': "AngularPOI",
        'home.back': "Back",

        //// CAMERA
        "ar.title" : "&uarr; Tilt down to see all places",
        "ar.subtitle" : "&larr; Move the device around to find spots &rarr;",
        "ar.popup.title" : "GPS off",
        "ar.popup.text" : "GPS is needed to use virtual reality",
        "ar.popup.button" : "Turn On",
        "ar.away" : "Km away"
    });

}

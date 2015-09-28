angular.module('services.screen', []).factory('screen', ['$rootScope', function($rootScope) {
    var uiService = {};

    uiService.moveToTop = function() {
        $("html, body").animate({ scrollTop: 0 }, "fast");
    };

    uiService.moveToButtom = function(el) {
		$("#container-messages").animate({ scrollTop: $("#container-messages")[0].scrollHeight }, "fast");
    };
    return uiService;
}]);
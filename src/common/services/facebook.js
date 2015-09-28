angular.module('services.facebook', []).factory('facebook', ['$rootScope', function($rootScope) {
    var uiService = {};

    uiService.init = function() {
        window.fbAsyncInit = function() {
            FB.init({
              appId      : '644787285631179',
              xfbml      : true,
              version    : 'v2.1'
            });
        };

        /*(function(d, s, id) {
			var js, fjs = d.getElementsByTagName(s)[0];
			if (d.getElementById(id)){ return;}
			js = d.createElement(s); js.id = id;
			js.src = "//connect.facebook.net/es_LA/sdk.js#xfbml=1&appId=644787285631179&version=v2.0";
			fjs.parentNode.insertBefore(js, fjs);
		}(document, 'script', 'facebook-jssdk'));*/

        (function(d, s, id){
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) {return;}
            js = d.createElement(s); js.id = id;
            js.src = "//connect.facebook.net/es_LA/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
    };
    return uiService;
}]);
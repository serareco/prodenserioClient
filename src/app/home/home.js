angular.module('AyudarEsFacilApp.home', [
    'ui.router'
])

.config(function config($stateProvider, $httpProvider) {
    $stateProvider.state('web.home', {
        url: '/home',
        controller: 'HomeCtrl',
        templateUrl: 'home/home.tpl.html',
        data: {
            pageTitle: 'Home'
        }
    });

    //Set the httpProvider "not authorized" interceptor
    $httpProvider.interceptors.push(['$q', '$location', 'Authentication',
        function($q, $location, Authentication) {
            return {
                responseError: function(rejection) {
                    switch (rejection.status) {
                        case 401:
                            // Deauthenticate the global user
                            Authentication.user = null;

                            // Redirect to signin page
                            $location.path('signin');
                            break;
                        case 403:
                            // Add unauthorized behaviour 
                            break;
                    }

                    return $q.reject(rejection);
                }
            };
        }
    ]);
})

// Authentication service for user variables
.factory('Authentication', [

    function() {
        var _this = this;

        _this._data = {
            user: JSON.parse(localStorage.getItem("user"))
        };

        return _this._data;
    }
])

.controller('HomeCtrl', function HomeController($scope, Authentication) {
    $scope.user = Authentication.user;
});

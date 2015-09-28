angular.module('directives.notifications', [])

.config(function config($httpProvider) {
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

.directive('notifications', function() {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'directives/notifications/notifications.tpl.html',
        controller: "NotificationsCtrl"
    };
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

.controller('NotificationsCtrl', function NotificationsCtrl($rootScope, $scope, Authentication, $http) {
    $scope.message = 0;
    $scope.user = Authentication.user;
    $scope.interval = 0;

    $scope.startInterval = function() {
        $scope.getQuantityUnreadsMessages();

        $scope.interval = setInterval(function() {
            $scope.getQuantityUnreadsMessages();
        }, 10000);
    };

    $scope.stopInterval = function() {
        clearInterval($scope.interval);
    };

    $scope.getQuantityUnreadsMessages = function() {
        $http({
            method: 'GET',
            url: '/ayudaresfacil/api/message/quantity',
            params: {
                userId: $scope.user.id
            }
        }).success(function(response) {
            $scope.error = false;
            $scope.message = response.data;
        }).error(function(response) {
            $scope.error = true;
        });
    };

    $scope.startInterval();

    $rootScope.$on('conversation.viewed', function() {
        $scope.stopInterval();
        $scope.startInterval();
    });
});

angular.module('directives.session.auth', [

])

.directive('sessionAuth', function() {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'directives/session/auth.tpl.html',
        controller: "AuthenticationCtrl",
        link: function (scope, element, attrs) {
        }
    };
})

;
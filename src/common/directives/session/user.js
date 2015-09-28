angular.module('directives.session.user', [])

.directive('sessionUser', function() {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'directives/session/user.tpl.html',
        controller: "AuthenticationCtrl"
    };
})

;

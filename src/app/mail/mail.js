angular.module('AyudarEsFacilApp.mail', [
    'ui.router'
])

.config(function config($stateProvider) {
    $stateProvider
        .state('panel.mail', {
            template: '<ui-view/>'
        })
        .state('panel.mail.inbox', {
            url: '/mensajes/bandeja-de-entrada',
            controller: 'InBoxCtrl',
            templateUrl: 'mail/mail-inbox.tpl.html',
            data: {
                pageTitle: 'Bandeja de Entrada'
            }
        })
        .state('panel.mail.read', {
            url: '/mensajes/leer',
            controller: 'ConversationCtrl',
            templateUrl: 'mail/mail-read.tpl.html',
            data: {
                pageTitle: 'Mensaje'
            }
        });
})

.service('ConversationService', ['$modal', function($modal) {
    this.openConversation = function(options) {
        var modalInstance = $modal.open({
            templateUrl: 'mail/mail-read.tpl.html',
            controller: 'ConversationCtrl',
            size: 'sm',
            resolve: {
                conversationOptions: function() {
                    return options;
                }
            }
        });

        return modalInstance;
    };
}])

.factory('Authentication', [

    function() {
        var _this = this;

        _this._data = {
            user: JSON.parse(localStorage.getItem("user"))
        };

        return _this._data;
    }
])

.factory('Conversations', ['$resource', function($resource) {
    return $resource('/ayudaresfacil/api/message', {}, {}, {
        update: {
            method: 'PUT'
        }
    });
}])

.factory('Messages', ['$resource', function($resource) {
        return $resource('/ayudaresfacil/api/message', {}, {}, {
            update: {
                method: 'PUT'
            }
        });
    }])
    .factory('Publications', ['$resource', function($resource) {
        return $resource('/ayudaresfacil/api/publication', {});
    }])

.controller('InBoxCtrl', function InBoxCtrl($rootScope, $scope, $filter, ConversationService, Conversations, Authentication) {
    var today = new Date();
    $scope.conversations = null;
    $scope.noConversations = true;
    $scope.openConversation = function(object) {
        ConversationService.openConversation(object);
    };

    $scope.getAllConversationsFromAllPublications = function() {
        $scope.conversations = null;
        $scope.noConversations = true;
        var conversations = Conversations.get({
            userInConversations: Authentication.user.id
        }, function(response) {
            if (response.result === undefined || response.result == "NOOK") {
                $scope.noConversations = true;
                $scope.conversations = null;
            } else {
                $scope.noConversations = false;
                $scope.conversations = response.data;
                $scope.publication = response.data[0].publication;
            }

            angular.forEach($scope.conversations, function(value, key) {
                var date = new Date(value.createDate.replace(/-/g, '/'));
                if ($filter('date')(date, 'dd/MM/yyyy') == $filter('date')(today, 'dd/MM/yyyy')) {
                    $scope.conversations[key].createDate = $filter('date')(date, 'HH:mm:ss');
                } else {
                    $scope.conversations[key].createDate = $filter('date')(date, 'dd/MM/yyyy HH:mm:ss');
                }
                if (value.userTo.id == Authentication.user.id) {
                    $scope.conversations[key].userTo.name += ' (Yo)';
                }
                if (value.userFrom.id == Authentication.user.id) {
                    $scope.conversations[key].userFrom.name += ' (Yo)';
                }
            });

        });
    };

    $scope.getAllConversationsFromMyPublications = function() {
        $scope.conversations = null;
        $scope.noConversations = true;
        var conversations = Conversations.get({
            userOwner: Authentication.user.id
        }, function(response) {
            if (response.result === undefined || response.result == "NOOK") {
                $scope.noConversations = true;
                $scope.conversations = null;
            } else {
                $scope.noConversations = false;
                $scope.conversations = response.data;
                $scope.publication = response.data[0].publication;
            }

            angular.forEach($scope.conversations, function(value, key) {
                var date = new Date(value.createDate.replace(/-/g, '/'));
                if ($filter('date')(date, 'dd/MM/yyyy') == $filter('date')(today, 'dd/MM/yyyy')) {
                    $scope.conversations[key].createDate = $filter('date')(date, 'HH:mm:ss');
                } else {
                    $scope.conversations[key].createDate = $filter('date')(date, 'dd/MM/yyyy HH:mm:ss');
                }
                if (value.userTo.id == Authentication.user.id) {
                    $scope.conversations[key].userTo.name += ' (Yo)';
                }
                if (value.userFrom.id == Authentication.user.id) {
                    $scope.conversations[key].userFrom.name += ' (Yo)';
                }
            });

        });
    };

    $scope.getAllConversationsFromOthersPublications = function() {
        $scope.conversations = null;
        $scope.noConversations = true;
        var conversations = Conversations.get({
            userNoOwner: Authentication.user.id
        }, function(response) {
            if (response.result === undefined || response.result == "NOOK") {
                $scope.noConversations = true;
                $scope.conversations = null;
            } else {
                $scope.noConversations = false;
                $scope.conversations = response.data;
                $scope.publication = response.data[0].publication;
            }

            angular.forEach($scope.conversations, function(value, key) {
                var date = new Date(value.createDate.replace(/-/g, '/'));
                if ($filter('date')(date, 'dd/MM/yyyy') == $filter('date')(today, 'dd/MM/yyyy')) {
                    $scope.conversations[key].createDate = $filter('date')(date, 'HH:mm:ss');
                } else {
                    $scope.conversations[key].createDate = $filter('date')(date, 'dd/MM/yyyy HH:mm:ss');
                }
                if (value.userTo.id == Authentication.user.id) {
                    $scope.conversations[key].userTo.name += ' (Yo)';
                }
                if (value.userFrom.id == Authentication.user.id) {
                    $scope.conversations[key].userFrom.name += ' (Yo)';
                }
            });

        });
    };

    $scope.markAsViewed = function(viewedConversationId) {
        if ($scope.conversations) {
            angular.forEach($scope.conversations, function(value, key) {
                if (value.conversationId == viewedConversationId) {
                    $scope.conversations[key].commonState = 'L';
                }
            });
        }
    };

    $rootScope.$on('conversation.viewed', function() {
        $scope.markAsViewed($rootScope.viewedConversationId);
    });

    $scope.getAllConversationsFromAllPublications();

})

.controller('ConversationCtrl', function ConversationCtrl($rootScope, $scope, $http, $stateParams, $filter, ConversationService, Conversations, Authentication, Messages, conversationOptions, Publications, screen) {

    var today = new Date();
    $scope.user = Authentication.user;
    $scope.getPublication = function() {
        var publication = Publications.get({
            publicationId: conversationOptions.publicationId
        }, function(response) {
            $scope.publication = response.data[0];
        });
    };

    $scope.getConversation = function() {
        var p_data = {};
        if (conversationOptions.conversationId === undefined) {
            p_data["userId"] = Authentication.user.id;
            p_data["publicationId"] = conversationOptions.publicationId;

            $http({
                    method: 'GET',
                    url: '/ayudaresfacil/api/message/getConversationByUserPublication',
                    params: p_data
                }).success(function(response) {
                    $scope.conversationId = response.data.conversationId;
                    $scope.getMessagesFromConversation();
                })
                .error(function(error) {

                });
        } else {
            $scope.conversationId = conversationOptions.conversationId;
            $scope.getMessagesFromConversation();
        }
    };

    $scope.getMessagesFromConversation = function() {
        var messages = Messages.get({
            conversationId: $scope.conversationId
        }, function(response) {
            if (response.result == "NOOK") {
                $scope.noMessages = true;
                $scope.messages = null;
            } else {
                $scope.noMessages = false;
                $scope.messages = response.data;
                $rootScope.viewedConversationId = $scope.conversationId;
                $rootScope.$emit('conversation.viewed');
            }

            angular.forEach($scope.messages, function(value, key) {
                var date = new Date(value.createDate.replace(/-/g, '/'));
                if ($filter('date')(date, 'dd/MM/yyyy') == $filter('date')(today, 'dd/MM/yyyy')) {
                    $scope.messages[key].createDate = $filter('date')(date, 'HH:mm:ss');
                } else {
                    $scope.messages[key].createDate = $filter('date')(date, 'dd/MM/yyyy HH:mm:ss');
                }
            });
            setTimeout(function() {
                screen.moveToButtom("#container-messages");
            }, 200);
        });
    };

    $scope.saveMessage = function() {
        if ($scope.messages !== undefined) {
            if ($scope.messages[0].userTo.id == Authentication.user.id) {
                userIdTo = $scope.messages[0].userFrom.id;
            } else {
                userIdTo = $scope.messages[0].userTo.id;
            }
        } else {
            userIdTo = $scope.publication.userId;
        }
        var userIdFrom = Authentication.user.id;
        var text = $('#inputText').val();
        var message = {
            "userFrom": userIdFrom,
            "userTo": userIdTo,
            "text": text,
            "publication": conversationOptions.publicationId,
            "conversationId": $scope.conversationId
        };

        var messages = new Messages(message);
        messages.$save(message,
            function(responseData) {
                $scope.getConversation();
                $('#inputText').val("");
            },
            function(error) {});

    };
    $scope.getPublication();
    $scope.getConversation();

});

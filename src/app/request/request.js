angular.module('AyudarEsFacilApp.request', [
    'ui.router', 'ui.bootstrap'
])

.config(function config($stateProvider, $httpProvider) {
    $stateProvider.state('web.requestList', {
        url: '/pedidos',
        controller: 'RequestCtrl',
        templateUrl: 'request/request-list.tpl.html',
        data: {
            pageTitle: 'Pedidos'
        }
    });
    $stateProvider.state('panel.requestCreate', {
        url: '/pedir-ayuda',
        controller: 'CreateRequestCtrl',
        templateUrl: 'request/request-create.tpl.html',
        data: {
            pageTitle: 'Crear Pedido'
        }
    });
    $stateProvider.state('web.requestDetail', {
        url: '/detalle-pedido/:id',
        controller: 'RequestCtrl',
        templateUrl: 'request/request-detail.tpl.html',
        data: {
            pageTitle: 'Detalle del Pedido'
        }
    });
    $stateProvider.state('panel.requestDetailUser', {
        url: '/detalle-mi-pedido/:id',
        controller: 'RequestCtrl',
        templateUrl: 'request/request-detail-user.tpl.html',
        data: {
            pageTitle: 'Detalle del Pedido'
        }
    });
    $stateProvider.state('panel.requestListUser', {
        url: '/mis-pedidos',
        controller: 'CreateRequestCtrl',
        templateUrl: 'request/request-list-user.tpl.html',
        data: {
            pageTitle: 'Pedidos'
        }
    });
    $stateProvider.state('panel.requestFavorites', {
        url: '/mis-pedidos-favoritos',
        controller: 'RequestFavorites',
        templateUrl: 'request/request-favorites.tpl.html',
        data: {
            pageTitle: 'Pedidos favoritos'
        }
    });
    $stateProvider.state('panel.requestEdit', {
        url: '/editar-pedido/:id',
        controller: 'RequestCtrl',
        templateUrl: 'request/request-edit.tpl.html',
        data: {
            pageTitle: 'Editar Pedido'
        }
    });
    $stateProvider.state('panel.requestHelps', {
        url: '/mis-ayudas',
        controller: 'RequestHelps',
        templateUrl: 'request/request-helps-list.tpl.html',
        data: {
            pageTitle: 'Pedidos favoritos'
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

.factory('Request', ['$resource',
    function($resource) {
        return $resource('/ayudaresfacil/api/request', {
            publicationId: '@id'
        }, {}, {
            update: {
                method: 'PUT'
            }
        });
    }
])

.controller('RequestCtrl', function RequestCtrl($scope, $http, Request, $state, $location, $stateParams, Authentication, ConversationService) {
    $scope.myInterval = 5000;
    $scope.user = Authentication.user;
    $scope.btnText = 'Publicar';
    $scope.likedLabels = [];
    $scope.sponsorDel = [];
    $scope.message = " ";
    $scope.activating = false;

    var requests = new Request();

    if ($stateParams.id === undefined || $stateParams.id === null) {
        if (Authentication.user === null) {
            requests.$get(function(response) {
                $scope.requests = requests.data;
                for (var i = $scope.requests.length - 1; i >= 0; i--) {
                    var percentaje = $scope.requests[i].amountCollected[0].quan * 100 / $scope.requests[i].quantity;
                    $scope.requests[i].progressValue = parseInt(percentaje, 10);
                }
            });
        } else {
            requests.$get({
                userLog: Authentication.user.id
            }, function(response) {
                $scope.requests = requests.data;
                for (var i = $scope.requests.length - 1; i >= 0; i--) {
                    var percentaje = $scope.requests[i].amountCollected[0].quan * 100 / $scope.requests[i].quantity;
                    $scope.requests[i].progressValue = parseInt(percentaje, 10);
                }
            }, function(error) {
                $scope.activating = true;
            });
        }
    } else {
        if (Authentication.user === null) {
            requests.$get({
                publicationId: $stateParams.id
            }, function(response) {
                $scope.requests = requests.data;
            });
        } else {
            requests.$get({
                userLog: Authentication.user.id,
                publicationId: $stateParams.id
            }, function(response) {
                $scope.requests = requests.data;
            });
        }
    }

    $scope.getCategories = function() {
        $http({
            method: 'GET',
            url: '/ayudaresfacil/api/category'
        }).success(function(response) {
            $scope.categories = response.data;
            $scope.subcategories = null;
            $scope.objects = null;
        }).error(function(response) {
            $scope.error = response.message;
            $scope.status = 'ERROR';
        });
    };

    $scope.getSubcategories = function(categoryId) {
        $http({
            method: 'GET',
            url: '/ayudaresfacil/api/subcategory',
            params: {
                categoryId: categoryId
            }
        }).success(function(response) {
            $scope.subcategories = response.data;
        }).error(function(response) {
            $scope.error = response.message;
            $scope.status = 'ERROR';
        });
    };

    $scope.getObjects = function(categoryId, subcategoryId) {
        $http({
            method: 'GET',
            url: '/ayudaresfacil/api/object',
            params: {
                subcategoryId: subcategoryId,
                categoryId: categoryId
            }
        }).success(function(response) {
            $scope.objects = response.data;
        }).error(function(response) {
            $scope.error = response.message;
            $scope.status = 'ERROR';
        });
    };

    $scope.submitFormEdit = function(isValid) {
        if (isValid) {
            var request = new Request($scope.requests[0]);
            request.publicationId = $stateParams.id;
            request.userId = Authentication.user.id;
            request.sponsorsn = $scope.likedLabels;

            var expiredDate = new Date(request.expirationDate);
            request.expirationDate = expiredDate.getTime() / 1000;

            $scope.btnText = ' Guardando....';
            request.$save(request,
                function(response) {
                    $scope.status = 'SUCCESS';
                    $scope.btnText = 'Publicar';
                    var retVal = confirm("Las modificaciones se han guardado con éxito");

                    if (retVal === true) {
                        $state.go("panel.requestListUser");
                        return true;
                    } else {
                        return false;
                    }
                },
                function(error) {
                    $scope.status = 'ERROR';
                    $scope.error = error;
                    $scope.btnText = 'Publicar';
                });
        }
    };

    $scope.toggleFavorite = function() {
        if (this.request.isFavorite === "0") {
            this.setFavorite(this.request.id);
        } else {
            this.unsetFavorite(this.request.id);
        }
    };

    $scope.setFavorite = function(id) {
        var data = {
            publicationId: id,
            userId: $scope.user.id
        };

        $http.post('/ayudaresfacil/api/request/favorite', data)
            .success(function(response) {
                $scope.error = false;
                requests.$get({
                    userLog: Authentication.user.id,
                    publicationId: $stateParams.id
                }, function(response) {
                    $scope.requests = requests.data;
                    for (var i = $scope.requests.length - 1; i >= 0; i--) {
                        var percentaje = $scope.requests[i].amountCollected[0].quan * 100 / $scope.requests[i].quantity;
                        $scope.requests[i].progressValue = parseInt(percentaje, 10);
                    }
                });
            })
            .error(function(response) {
                $scope.error = true;
                $scope.credentials = {};
            });
    };

    $scope.unsetFavorite = function(id) {
        var data = {
            publicationId: id,
            userId: $scope.user.id,
            del: 'true'
        };

        $http.post('/ayudaresfacil/api/request/favorite', data)
            .success(function(response) {
                $scope.error = false;
                requests.$get({
                    userLog: Authentication.user.id,
                    publicationId: $stateParams.id
                }, function(response) {
                    $scope.requests = requests.data;
                    for (var i = $scope.requests.length - 1; i >= 0; i--) {
                        var percentaje = $scope.requests[i].amountCollected[0].quan * 100 / $scope.requests[i].quantity;
                        $scope.requests[i].progressValue = parseInt(percentaje, 10);
                    }
                });
            })
            .error(function(response) {
                $scope.error = true;
                $scope.credentials = {};
            });
    };

    $scope.setVote = function(id) {
        var data = {
            publicationId: id,
            userId: $scope.user.id
        };

        $http.post('/ayudaresfacil/api/request/vote', data)
            .success(function(response) {
                $scope.error = false;
                requests.$get({
                    userLog: Authentication.user.id,
                    publicationId: $stateParams.id
                }, function(response) {
                    $scope.requests = requests.data;
                });
            })
            .error(function(response) {
                $scope.error = true;
                $scope.credentials = {};
            });
    };

    $scope.unsetVote = function(id) {
        var data = {
            publicationId: id,
            userId: $scope.user.id,
            del: 'true'
        };

        $http.post('/ayudaresfacil/api/request/vote', data)
            .success(function(response) {
                $scope.error = false;
                requests.$get({
                    userLog: Authentication.user.id,
                    publicationId: $stateParams.id
                }, function(response) {
                    $scope.requests = requests.data;
                });
            })
            .error(function(response) {
                $scope.error = true;
                $scope.credentials = {};
            });
    };

    $scope.addInput = function() {
        if ($scope.likedLabels.length < 4) {
            $scope.likedLabels.push({
                label: ''
            });
        } else {
            $scope.msgSponsor = 'Has llegado al límite de padrinos';
        }
    };

    $scope.deleteInput = function(idx) {
        var request_to_delete = $scope.likedLabels[idx];
        $scope.likedLabels.splice(idx, 1);
    };

    $scope.addDeleteSponsor = function(idx, id) {
        $scope.sponsorDel.push({
            sponsorId: id
        });
    };

    $scope.openConversation = function(ConversationsOptions) {
        ConversationService.openConversation(ConversationsOptions);
    };

    $scope.getCategories();
})

.controller('CreateRequestCtrl', function CreateRequestCtrl($scope, $http, $location, $stateParams, $state, Request, Authentication) {

    $scope.user = Authentication.user;
    $scope.btnText = 'Publicar';
    $scope.msgSuccess = '0';
    $scope.msgSponsor = '';
    $scope.likedLabels = [];
    $scope.activating = false;

    // If user is not signed in then redirect back home
    if (!$scope.user) {
        $location.path('/signin');
    }

    var date = new Date();
    var requests = new Request();

    $scope.submitForm = function(isValid) {
        if (isValid) {
            var request = new Request($scope.request);
            request.userId = Authentication.user.id;
            request.creationDate = date;
            request.votes = 0;
            request.sponsors = $scope.likedLabels;

            var expiredDate = new Date(request.expirationDate);
            request.expirationDate = expiredDate.getTime() / 1000;

            $scope.btnText = ' Guardando....';
            request.$save(request,
                function(response) {

                    var pSave = $scope.saveImages(response.publicationId);
                    pSave.then(function(response){
                        $scope.status = 'SUCCESS';
                        $scope.btnText = 'Publicar';
                        $scope.request = null;
                        $state.go('panel.requestListUser');
                    });
                    
                },
                function(error) {
                    $scope.status = 'ERROR';
                    $scope.error = error;
                    $scope.btnText = 'Publicar';
                });
        }

    };

    $scope.requestDelete = function(id) {
        var retVal = confirm("Seguro que quieres dar de baja la publicación?");

        if (retVal === true) {
            var data = {
                publicationId: id,
                userId: $scope.user.id,
                del: 'true'
            };

            $http.post('/ayudaresfacil/api/request/delete', data)
                .success(function(response) {
                    $scope.error = false;
                    $scope.requestsUser();
                })
                .error(function(response) {
                    $scope.error = true;
                });

            return true;
        } else {
            return false;
        }
    };

    $scope.toggleFavorite = function() {
        if (this.request.isFavorite === "0") {
            this.setFavorite(this.request.id);
        } else {
            this.unsetFavorite(this.request.id);
        }
    };

    $scope.requestsUser = function(message) {
        requests.$get({
            userLog: Authentication.user.id,
            userId: Authentication.user.id
        }, function(response) {
            $scope.requests = requests.data;
            $scope.msgSuccess = '1';
            for (var i = $scope.requests.length - 1; i >= 0; i--) {
                var percentaje = $scope.requests[i].amountCollected[0].quan * 100 / $scope.requests[i].quantity;
                $scope.requests[i].progressValue = parseInt(percentaje, 10);
            }
        }, function(error) {
            $scope.activating = true;
        });
    };

    $scope.getSubcategories = function(categoryId) {
        $http({
            method: 'GET',
            url: '/ayudaresfacil/api/subcategory',
            params: {
                categoryId: categoryId
            }
        }).success(function(response) {
            $scope.subcategories = response.data;
        }).error(function(response) {
            $scope.error = response.message;
            $scope.status = 'ERROR';
        });
    };

    $scope.saveImages = function(publicationId) {
        var files = document.getElementById('inputFile').files,
            fd = new FormData();

        angular.forEach(files, function(file, key) {
            fd.append("file_" + key, file);
        });

        fd.append("publicationId", publicationId);

        return $http.post('/ayudaresfacil/api/request/image', fd, {
            headers: {'Content-Type': undefined },
            transformRequest: angular.identity
        });
    };

    $scope.getCategories = function() {
        $http({
            method: 'GET',
            url: '/ayudaresfacil/api/category'
        }).success(function(response) {
            $scope.categories = response.data;
            $scope.subcategories = null;
            $scope.objects = null;
        }).error(function(response) {
            $scope.error = response.message;
            $scope.status = 'ERROR';
        });
    };

    $scope.getSubcategories = function(categoryId) {
        $http({
            method: 'GET',
            url: '/ayudaresfacil/api/subcategory',
            params: {
                categoryId: categoryId
            }
        }).success(function(response) {
            $scope.subcategories = response.data;
        }).error(function(response) {
            $scope.error = response.message;
            $scope.status = 'ERROR';
        });
    };

    $scope.getObjects = function(categoryId, subcategoryId) {
        $http({
            method: 'GET',
            url: '/ayudaresfacil/api/object',
            params: {
                subcategoryId: subcategoryId,
                categoryId: categoryId
            }
        }).success(function(response) {
            $scope.objects = response.data;
        }).error(function(response) {
            $scope.error = response.message;
            $scope.status = 'ERROR';
        });
    };

    $scope.setFavorite = function(id) {
        var data = {
            publicationId: id,
            userId: $scope.user.id
        };

        $http.post('/ayudaresfacil/api/request/favorite', data)
            .success(function(response) {
                $scope.error = false;
                requests.$get({
                    userLog: Authentication.user.id,
                    publicationId: $stateParams.id
                }, function(response) {
                    $scope.requests = requests.data;
                    for (var i = $scope.requests.length - 1; i >= 0; i--) {
                        var percentaje = $scope.requests[i].amountCollected[0].quan * 100 / $scope.requests[i].quantity;
                        $scope.requests[i].progressValue = parseInt(percentaje, 10);
                    }
                });
            })
            .error(function(response) {
                $scope.error = true;
                $scope.credentials = {};
            });
    };

    $scope.unsetFavorite = function(id) {
        var data = {
            publicationId: id,
            userId: $scope.user.id,
            del: 'true'
        };

        $http.post('/ayudaresfacil/api/request/favorite', data)
            .success(function(response) {
                $scope.error = false;
                requests.$get({
                    userLog: Authentication.user.id,
                    publicationId: $stateParams.id
                }, function(response) {
                    $scope.requests = requests.data;
                    for (var i = $scope.requests.length - 1; i >= 0; i--) {
                        var percentaje = $scope.requests[i].amountCollected[0].quan * 100 / $scope.requests[i].quantity;
                        $scope.requests[i].progressValue = parseInt(percentaje, 10);
                    }
                });
            })
            .error(function(response) {
                $scope.error = true;
                $scope.credentials = {};
            });
    };

    $scope.addInput = function() {
        if ($scope.likedLabels.length < 4) {
            $scope.likedLabels.push({
                label: ''
            });
        } else {
            $scope.msgSponsor = 'Has llegado al límite de padrinos';
        }
    };

    $scope.deleteInput = function(idx) {
        var request_to_delete = $scope.likedLabels[idx];
        $scope.likedLabels.splice(idx, 1);
    };

    $scope.requestsUser();
    $scope.getCategories();

})

.controller('RequestFavorites', function RequestFavorites($scope, $http, Authentication, Request, $stateParams) {
    $scope.user = Authentication.user;
    $scope.message = " ";
    $scope.activating = false;

    var requests = new Request();

    $scope.setFavorite = function(id) {
        var data = {
            publicationId: id,
            userId: $scope.user.id
        };

        $http.post('/ayudaresfacil/api/request/favorite', data)
            .success(function(response) {
                $scope.error = false;
                requests.$get({
                    userLog: Authentication.user.id,
                    publicationId: $stateParams.id
                }, function(response) {
                    $scope.requests = requests.data;
                    for (var i = $scope.requests.length - 1; i >= 0; i--) {
                        var percentaje = $scope.requests[i].amountCollected[0].quan * 100 / $scope.requests[i].quantity;
                        $scope.requests[i].progressValue = parseInt(percentaje, 10);
                    }
                });
            })
            .error(function(response) {
                $scope.error = true;
                $scope.credentials = {};
            });
    };

    $scope.unsetFavorite = function(id) {
        var data = {
            publicationId: id,
            userId: $scope.user.id,
            del: 'true'
        };

        $http.post('/ayudaresfacil/api/request/favorite', data)
            .success(function(response) {
                $scope.error = false;
                requests.$get({
                    userLog: Authentication.user.id,
                    publicationId: $stateParams.id
                }, function(response) {
                    $scope.requests = requests.data;
                    for (var i = $scope.requests.length - 1; i >= 0; i--) {
                        var percentaje = $scope.requests[i].amountCollected[0].quan * 100 / $scope.requests[i].quantity;
                        $scope.requests[i].progressValue = parseInt(percentaje, 10);
                    }
                });
            })
            .error(function(response) {
                $scope.error = true;
                $scope.credentials = {};
            });
    };

    $scope.requestFavoritesUser = function() {
        $scope.requests = null;
        $http({
            method: 'GET',
            url: '/ayudaresfacil/api/request/favorite',
            params: {
                userId: Authentication.user.id
            }
        }).success(function(response) {
            $scope.requests = response.data;
            for (var i = $scope.requests.length - 1; i >= 0; i--) {
                var percentaje = $scope.requests[i].amountCollected[0].quan * 100 / $scope.requests[i].quantity;
                $scope.requests[i].progressValue = parseInt(percentaje, 10);
            }
        }).error(function(response) {
            $scope.error = response.message;
            $scope.status = 'ERROR';
            $scope.activating = true;
        });
    };

    $scope.toggleFavorite = function() {
        if (this.request.isFavorite === "0") {
            this.setFavorite(this.request.id);
        } else {
            this.unsetFavorite(this.request.id);
        }
    };

    $scope.requestFavoritesUser();
})

.controller('RequestHelps', function RequestHelps($scope, $http, Authentication, Request, $stateParams, facebook) {
    $scope.message = " ";
    $scope.user = Authentication.user;
    $scope.activating = false;
    facebook.init();
    if (!$scope.user) {
        $location.path('/signin');
        return;
    }

    $scope.requestHelpsUser = function() {
        $scope.requests = null;
        $http({
            method: 'GET',
            url: '/ayudaresfacil/api/request/helps',
            params: {
                userId: Authentication.user.id
            }
        }).success(function(response) {
            $scope.requests = response.data;

            angular.forEach($scope.requests, function(request, idx) {
                $scope.donations = null;
                $http({
                    method: 'GET',
                    url: '/ayudaresfacil/api/donation',
                    params: {
                        userId: Authentication.user.id,
                        publicationId: request.id
                    }
                }).success(function(response) {
                    $scope.requests[idx].donations = response.data;
                    var amountDonated = 0;
                    angular.forEach($scope.requests[idx].donations, function(donation, idx) {
                        if (donation.processState.id == 'F') {
                            angular.forEach(donation.donatedObjects, function(donatedObject, idx) {
                                amountDonated += parseFloat(donatedObject.quantity);
                            });
                        }
                    });
                    $scope.requests[idx].amountDonated = amountDonated;

                }).error(function(error) {
                    $scope.error = error.message;
                    $scope.status = 'ERROR';
                });
            });

        }).error(function(error) {
            $scope.error = error.message;
            $scope.status = 'ERROR';
            $scope.activating = true;
        });

        $scope.confirmHelp = function(id) {
            $http({
                method: 'GET',
                url: '/ayudaresfacil/api/donation/confirmHelp',
                params: {
                    id: id
                }
            }).success(function(response) {
                angular.forEach($scope.requests, function(request, idx) {
                    angular.forEach(request.donations, function(donation, idx) {
                        if (donation.id == id) {
                            donation.processState.id = "F";
                        }
                    });
                });
            });
        };

        $scope.cancelHelp = function(id) {
            $http({
                method: 'GET',
                url: '/ayudaresfacil/api/donation/cancelHelp',
                params: {
                    id: id
                }
            }).success(function(response) {
                angular.forEach($scope.requests, function(request, idx) {
                    angular.forEach(request.donations, function(donation, idx) {
                        if (donation.id == id) {
                            donation.processState.id = "C";
                        }
                    });
                });
            });
        };

    };

    $scope.requestHelpsUser();
});

angular.module('AyudarEsFacilApp.offer', [
    'ui.router', 'ui.bootstrap'
])

.config(function config($stateProvider, $httpProvider) {
    $stateProvider.state('web.offerList', {
        url: '/ofrecimientos',
        controller: 'OfferCtrl',
        templateUrl: 'offer/offer-list.tpl.html',
        data: {
            pageTitle: 'Ofrecimientos'
        }
    });
    $stateProvider.state('panel.offerCreate', {
        url: '/ofrecer-ayuda',
        controller: 'CreateOfferCtrl',
        templateUrl: 'offer/offer-create.tpl.html',
        data: {
            pageTitle: 'Crear Ofrecimiento'
        }
    });
    $stateProvider.state('web.offerDetail', {
        url: '/detalle-ofrecimiento/:id',
        controller: 'OfferCtrl',
        templateUrl: 'offer/offer-detail.tpl.html',
        data: {
            pageTitle: 'Detalle del Ofrecimiento'
        }
    });
    $stateProvider.state('panel.offerDetailUser', {
        url: '/detalle-mi-ofrecimiento/:id',
        controller: 'OfferCtrl',
        templateUrl: 'offer/offer-detail-user.tpl.html',
        data: {
            pageTitle: 'Detalle del Ofrecimiento'
        }
    });
    $stateProvider.state('panel.offerListUser', {
        url: '/mis-ofrecimientos',
        controller: 'CreateOfferCtrl',
        templateUrl: 'offer/offer-list-user.tpl.html',
        data: {
            pageTitle: 'Ofrecimientos'
        }
    });
    $stateProvider.state('panel.offerFavorites', {
        url: '/mis-ofrecimientos-favoritos',
        controller: 'OfferFavorites',
        templateUrl: 'offer/offer-favorites.tpl.html',
        data: {
            pageTitle: 'Ofrecimientos favoritos'
        }
    });
    $stateProvider.state('panel.offerEdit', {
        url: '/editar-ofrecimiento/:id',
        controller: 'OfferCtrl',
        templateUrl: 'offer/offer-edit.tpl.html',
        data: {
            pageTitle: 'Editar Ofrecimiento'
        }
    });

    $stateProvider.state('panel.offerNeeds', {
        url: '/mis-necesidades',
        controller: 'OfferNeedsCtrl',
        templateUrl: 'offer/offer-needs-list.tpl.html',
        data: {
            pageTitle: 'Mis Necesidades'
        }
    });

/*    $stateProvider.state('panel.offerRequest', {
        url: '/pedidos-de-ofrecimientos',
        controller: 'OfferRequestCtrl',
        templateUrl: 'offer/offer-request-list.tpl.html',
        data: {
            pageTitle: 'Pedidos de usuarios sobre mis Ofrecimientos'
        }
    });*/

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

.factory('Offers', ['$resource',
    function($resource) {
        return $resource('/ayudaresfacil/api/offer', {
            publicationId: '@id'
        }, {}, {
            update: {
                method: 'PUT'
            },
            remove: {
                method: 'DELETE'
            }
        });
    }
])

.controller('OfferCtrl', function OfferCtrl($scope, $http, Offers, $state, $stateParams, Authentication, ConversationService) {
    $scope.myInterval = 5000;
    $scope.user = Authentication.user;
    $scope.btnText = 'Publicar';
    $scope.message = " ";

    var offers = new Offers();

    if ($stateParams.id === undefined || $stateParams.id === null) {
        if (Authentication.user === null) {
            offers.$get(function(response) {
                $scope.offers = offers.data;
            });
        } else {
            offers.$get({
                userLog: Authentication.user.id
            }, function(response) {
                $scope.offers = offers.data;
            });
        }
    } else {
        if (Authentication.user === null) {
            offers.$get({
                publicationId: $stateParams.id
            }, function(response) {
                $scope.offers = offers.data;
            });
        } else {
            offers.$get({
                userLog: Authentication.user.id,
                publicationId: $stateParams.id
            }, function(response) {
                $scope.offers = offers.data;
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
            var offer = new Offers($scope.offers[0]);
            offer.publicationId = $stateParams.id;
            offer.userId = Authentication.user.id;

            var expiredDate = new Date(offer.expirationDate);
            offer.expirationDate = expiredDate.getTime() / 1000;

            $scope.btnText = ' Guardando....';
            offer.$save(offer,
                function(response) {
                    $scope.status = 'SUCCESS';
                    $scope.btnText = 'Publicar';
                    var retVal = confirm("Las modificaciones se han guardado con éxito");

                    if (retVal === true) {
                        $state.go("panel.offerListUser");
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
        if (this.offer.isFavorite === "0") {
            this.setFavorite(this.offer.id);
        } else {
            this.unsetFavorite(this.offer.id);
        }
    };

    $scope.setFavorite = function(id) {
        var data = {
            publicationId: id,
            userId: $scope.user.id
        };

        $http.post('/ayudaresfacil/api/offer/favorite', data)
            .success(function(response) {
                $scope.error = false;
                offers.$get({
                    userLog: Authentication.user.id,
                    publicationId: $stateParams.id
                }, function(response) {
                    $scope.offers = offers.data;
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

        $http.post('/ayudaresfacil/api/offer/favorite', data)
            .success(function(response) {
                $scope.error = false;
                offers.$get({
                    userLog: Authentication.user.id,
                    publicationId: $stateParams.id
                }, function(response) {
                    $scope.offers = offers.data;
                });
            })
            .error(function(response) {
                $scope.error = true;
                $scope.credentials = {};
            });
    };

    $scope.offerDelete = function(id) {
        var retVal = confirm("Seguro que quieres dar de baja la publicación?");

        if (retVal === true) {
            var data = {
                publicationId: id,
                userId: $scope.user.id
            };

            $http.post('/ayudaresfacil/api/offer/delete', data)
                .success(function(response) {
                    $scope.error = false;
                    $state.go('panel.offerListUser');
                    $scope.offersUser();
                }).error(function(response) {
                    $scope.error = true;
                });

            return true;
        } else {
            return false;
        }
    };

    $scope.openConversation = function(ConversationsOptions) {
        ConversationService.openConversation(ConversationsOptions);
    };

    $scope.getCategories();
})

.controller('CreateOfferCtrl', function CreateOfferCtrl($scope, $http, $location, $stateParams, $state, Offers, Authentication) {

    $scope.user = Authentication.user;

    // If user is not signed in then redirect back home
    if (!$scope.user) {
        $location.path('/signin');
    }

    $scope.btnText = 'Publicar';
    $scope.msgSuccess = '0';

    var date = new Date();
    var offers = new Offers();

    $scope.submitForm = function(isValid) {
        if (isValid) {
            var offer = new Offers($scope.offer);
            offer.userId = Authentication.user.id;
            offer.creationDate = date;
            offer.votes = 0;

            var expiredDate = new Date(offer.expirationDate);
            offer.expirationDate = expiredDate.getTime() / 1000;

            $scope.btnText = ' Guardando....';

            offer.$save(offer,
                function(response) {
                    var pSave = $scope.saveImages(response.publicationId);
                    pSave.then(function(response){
                        $scope.status = 'SUCCESS';
                        $scope.btnText = 'Publicar';
                        $scope.offer = null;
                        $state.go('panel.offerListUser');
                    });
                },
                function(error) {
                    $scope.status = 'ERROR';
                    $scope.error = error;
                    $scope.btnText = 'Publicar';
                });
        }
    };


    $scope.offerDelete = function(id) {
        var retVal = confirm("Seguro que quieres dar de baja la publicación?");

        if (retVal === true) {
            var data = {
                publicationId: id,
                userId: $scope.user.id
            };

            $http.post('/ayudaresfacil/api/offer/delete', data)
                .success(function(response) {
                    $scope.error = false;
                    $state.go('panel.offerListUser');
                    $scope.offersUser();
                }).error(function(response) {
                    $scope.error = true;
                });

            return true;
        } else {
            return false;
        }
    };

    $scope.offersUser = function(message) {
        offers.$get({
                userLog: Authentication.user.id,
                userId: Authentication.user.id
            }, function(response) {
                $scope.offers = offers.data;
                $scope.msgSuccess = '1';
            },
            function(error) {
                $scope.activating = true;
            });
    };

    $scope.setFavorite = function(id) {
        var data = {
            publicationId: id,
            userId: $scope.user.id
        };

        $http.post('/ayudaresfacil/api/offer/favorite', data)
            .success(function(response) {
                $scope.error = false;
                offers.$get({
                    userLog: Authentication.user.id,
                    publicationId: $stateParams.id
                }, function(response) {
                    $scope.offers = offers.data;
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

        $http.post('/ayudaresfacil/api/offer/favorite', data)
            .success(function(response) {
                $scope.error = false;
                offers.$get({
                    userLog: Authentication.user.id,
                    publicationId: $stateParams.id
                }, function(response) {
                    $scope.offers = offers.data;
                });
            })
            .error(function(response) {
                $scope.error = true;
                $scope.credentials = {};
            });
    };

    $scope.toggleFavorite = function() {
        if (this.offer.isFavorite === "0") {
            this.setFavorite(this.offer.id);
        } else {
            this.unsetFavorite(this.offer.id);
        }
    };

    $scope.getCategories = function() {
        $http({
            method: 'GET',
            url: '/ayudaresfacil/api/category'
        }).success(function(response) {
            $scope.categories = response.data;
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

    $scope.saveImages = function(publicationId) {
        var files = document.getElementById('inputFile').files,
            fd = new FormData();

        angular.forEach(files, function(file, key) {
            fd.append("file_" + key, file);
        });

        fd.append("publicationId", publicationId);

        return $http.post('/ayudaresfacil/api/offer/image', fd, {
            headers: {'Content-Type': undefined },
            transformRequest: angular.identity
        });
    };

    $scope.offersUser();
    $scope.getCategories();

})

.controller('OfferFavorites', function OfferFavorites($scope, $http, Offers, Authentication, $stateParams) {
    $scope.user = Authentication.user;
    $scope.message = " ";
    $scope.activating = false;

    var offers = new Offers();

    $scope.setFavorite = function(id) {
        var data = {
            publicationId: id,
            userId: $scope.user.id
        };

        $http.post('/ayudaresfacil/api/offer/favorite', data)
            .success(function(response) {
                $scope.error = false;
                offers.$get({
                    userLog: Authentication.user.id,
                    publicationId: $stateParams.id
                }, function(response) {
                    $scope.offers = offers.data;
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

        $http.post('/ayudaresfacil/api/offer/favorite', data)
            .success(function(response) {
                $scope.error = false;
                offers.$get({
                    userLog: Authentication.user.id,
                    publicationId: $stateParams.id
                }, function(response) {
                    $scope.offers = offers.data;
                });
            })
            .error(function(response) {
                $scope.error = true;
                $scope.credentials = {};
            });
    };

    $scope.toggleFavorite = function() {
        if (this.offer.isFavorite === "0") {
            this.setFavorite(this.offer.id);
        } else {
            this.unsetFavorite(this.offer.id);
        }
    };

    $scope.offerFavoritesUser = function() {
        $scope.offers = null;
        $http({
            method: 'GET',
            url: '/ayudaresfacil/api/offer/favorite',
            params: {
                userId: Authentication.user.id
            }
        }).success(function(response) {
            $scope.offers = response.data;
        }).error(function(response) {
            $scope.error = response.message;
            $scope.status = 'ERROR';
            $scope.activating = true;
        });
    };

    $scope.offerFavoritesUser();
})
.controller('OfferNeedsCtrl', function OfferRequestCtrl($scope, $http, Offers, Authentication, $stateParams) {
        $scope.offers = null;
        $scope.activating = false;
    $scope.offerNeedsUser = function() {    
        $http({
            method: 'GET',
            url: '/ayudaresfacil/api/offer/needs',
            params: {
                userId: Authentication.user.id
            }
        }).success(function(response) {
            $scope.offers = response.data;
        }).error(function(error) {
            $scope.error = error.message;
            $scope.status = 'ERROR';
            $scope.activating = true;
        });
    };

    $scope.offerNeedsUser();
})
/*.controller('OfferRequestCtrl', function OfferRequestCtrl($scope, $http, Offers, Authentication, $stateParams) {
})*/;

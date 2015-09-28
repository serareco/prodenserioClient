angular.module( 'AyudarEsFacilApp.checkout', [
])

.config(function config($stateProvider) {
    $stateProvider.state('web.offerFlow', {
        url: '/checkout/offer/:publicationId',
        controller: 'CheckoutCtrl',
        templateUrl: 'checkout/offer-flow.tpl.html',
        data: {
            pageTitle: 'Lo necesito',
            publicationType: 'offer'
        }
    })
    .state('web.requestFlow', {
        url: '/checkout/request/:publicationId',
        controller: 'CheckoutCtrl',
        templateUrl: 'checkout/request-flow.tpl.html',
        data: {
            pageTitle: 'Quiero ayudar',
            publicationType: 'request'
        }
    })
    .state('web.moneyFlow', {
        url: '/checkout/money/:publicationId',
        controller: 'CheckoutCtrl',
        templateUrl: 'checkout/money-flow.tpl.html',
        data: {
            pageTitle: 'Quiero ayudar',
            publicationType: 'money'
        }
    });
})

.controller('CheckoutCtrl', function CheckoutCtrl($scope, $http, $location, $state, $stateParams, Authentication, Offers, Request, Users) {  
    $scope.user = Authentication.user;

    if (!$scope.user) {
        $location.path('/');
        return;
    }

    var that = this;

    $scope.error = '';
    $scope.publicationType = $state.current.data.publicationType;
    $scope.publicationId = $stateParams.publicationId;
    $scope.offer = {};

    /**
     * FLOWS
     */

    this.offerFlow = function(){  
        this.steps = 2;
        this.offerService = new Offers();
        
        $scope.flow.endStep = this.steps;
        $scope.comments = '';

        this.getData = function(){
            this.promiseOffer = this.offerService.$get({
                publicationId: $scope.publicationId
            });

            this.promiseOffer.then(function(response) {
                $scope.offer = response.data[0];
            });
        };

        this.end = function(){   
            $scope.status = 'loading';
            
            var message = $scope.user.name + ' ha dicho que necesita lo que ofreces. Contacta con el para finalizar el proceso';

            if($scope.comments.length > 0){
                message += '. Comentarios: ' + $scope.comments;
            }

            $http.post('/ayudaresfacil/api/checkout/end',{
                userFromId: $scope.user.id,
                userToId: $scope.offer.userId, 
                publicationId: $scope.offer.id, 
                publicationType: $scope.publicationType,
                comments: message, 
                objectId: $scope.offer.object.id,
                quantity: 1,
                token: $scope.user.token

            })
            .success(function(response) {
                $scope.status = 'congrats';
            }).error(function(response) {
                $scope.status = 'fail';
            });
        };

        this.getData();
    };

    this.requestFlow = function(){
        this.steps = 2;
        this.requestService = new Request();
        
        $scope.flow.endStep = this.steps;
        $scope.comments = '';

        this.getData = function(){
            this.promiseRequest = this.requestService.$get({
                publicationId: $scope.publicationId
            });

            this.promiseRequest.then(function(response) {
                $scope.request = response.data[0];
            });
        };

        this.end = function(){   
            $scope.status = 'loading';
            var message = $scope.user.name + ' ha dicho que tiene lo que necesitas. Contacta con el para finalizar el proceso';

            if($scope.comments.length > 0){
                message += '. Comentarios: ' + $scope.comments;
            }

            $http.post('/ayudaresfacil/api/checkout/end',{
                userFromId: $scope.user.id,
                userToId: $scope.request.userId, 
                publicationId: $scope.request.id, 
                publicationType: $scope.publicationType,
                comments: message,
                objectId: $scope.request.object.id,
                quantity: 1,
                token: $scope.user.token
            })
            .success(function(response) {
                $scope.status = 'congrats';
            }).error(function(response) {
                $scope.status = 'fail';
            });
        };

        this.getData();
    };

    this.moneyFlow = function(){
        this.steps = 2;
        this.requestService = new Request();
        
        $scope.flow.endStep = this.steps;
        $scope.comments = '';

        this.getData = function(){
            this.promiseRequest = this.requestService.$get({
                publicationId: $scope.publicationId
            });

            this.promiseRequest.then(function(response) {
                $scope.request = response.data[0];

                // $http.post('/ayudaresfacil/api/checkout/auth',{
                //     userId: $scope.request.user.id,
                //     token: $scope.user.token
                // })
                // .success(function(response) {
                //     $scope.status = 'congrats';
                // }).error(function(response) {
                //     $scope.status = 'fail';
                // });
            });
        };

        this.end = function(){  
            if ($scope.paymentStatus == 'approved') {
                $scope.paymentStatusMessage = 'El pago ha sido acreditado';
            } else if ($scope.paymentStatus == 'pending') {
                $scope.paymentStatusMessage = 'El usuario no completó el pago';
            } else if ($scope.paymentStatus == 'in_process') {
                $scope.paymentStatusMessage = 'El pago está siendo revisado';
            } else if ($scope.paymentStatus == 'rejected') {
                $scope.paymentStatusMessage = 'El pago fué rechazado, el usuario puede intentar nuevamente el pago';
            } else if ($scope.paymentStatus == null) {
                $scope.paymentStatusMessage = 'El usuario no completó el proceso de pago, no se ha generado ningún pago';
            }
             
            $scope.status = 'loading';
            var message = $scope.user.name + ' ha dicho que tiene lo que necesitas. Contacta con el para finalizar el proceso';

            if($scope.comments.length > 0){
                message += '. Comentarios: ' + $scope.comments;
            }

            $http.post('/ayudaresfacil/api/checkout/end',{
                userFromId: $scope.user.id,
                userToId: $scope.request.userId, 
                publicationId: $scope.request.id, 
                publicationType: $scope.publicationType,
                comments: message,
                objectId: $scope.request.object.id,
                quantity: $scope.price,
                token: $scope.user.token
            })
            .success(function(response) {
                $scope.status = 'congrats';
            }).error(function(response) {
                $scope.status = 'fail';
            });

            $scope.$apply();
        };

        this.getData();
    };

    this.flowsByPublicationType = {
        'request': this.requestFlow,
        'offer': this.offerFlow,
        'money': this.moneyFlow
    };
    
    /* END OF FLOWS */

    /**
     * FLOW HANDLER
     */
    
    $scope.flow = {
        step: 0,
        goal: {},
        toNextStep: function(){
            this.step++;
            $scope.$emit('flow.nextStep');
        },
        toPrevStep: function(){
            this.step--;
        }
    };

    $scope.flow.goal = new this.flowsByPublicationType[$scope.publicationType]();
    
    /* END OF FLOW HANDLER */
    
    $scope.$on('flow.nextStep', function(){
        if($scope.flow.step === $scope.flow.endStep){
            $scope.flow.goal.end();
        }
    });
})
;

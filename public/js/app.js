var firstdatefail = angular.module('firstdatefail', ['ngRoute']);

/**********************
*       CONFIG        *
**********************/

firstdatefail.config(['$routeProvider', function($routeProvider) {
    $routeProvider.
        when('/', {
            templateUrl: 'partials/fails-list.html',
            controller: 'mainController',
            access : { requiredLogin : false }
        }).
        when('/admin', {
            templateUrl : 'partials/admin.html',
            controller: 'adminController',
            access : { requiredLogin : true }
        }).
        when('/login', {
            templateUrl : 'partials/login.html',
            controller: 'loginController',
            access : { requiredLogin : false }
        }).
        otherwise({
            redirectTo : '/',
            access : { requiredLogin : false }
        });
}]);

firstdatefail.config(['$httpProvider', function($httpProvider){
    $httpProvider.interceptors.push('tokenInterceptor');
}]);

firstdatefail.run(
    function ($rootScope,$location,authenticationService){
        $rootScope.$on("$routeChangeStart", function(event, nextRoute, currentRoute){
            if (nextRoute.access.requiredLogin && !authenticationService.isLogged){
                $location.path("/login");
            }
        });
    }
);



/**********************
*    CONTROLLERS      *
**********************/

firstdatefail.controller('rootController',['$rootScope','$scope','$window','$location','authenticationService',
    function rootController($rootScope,$scope,$window, $location, authenticationService){

        $rootScope.isLogged = false;
        console.log("init set isLogged false");

        // init
        if ( $window.sessionStorage.token) {
             $rootScope.isLogged = true;
             authenticationService.isLogged = true;
             console.log("init set isLogged true");
        }

        // loggout
        $scope.logout = function logout(){
            if (authenticationService.isLogged){
                console.log("logging OUT");
                authenticationService.isLogged = false;
                delete $window.sessionStorage.token;
                $location.path("/");
                $rootScope.isLogged = false;
            }
        }

    }
]);

firstdatefail.controller('mainController',['$rootScope','$scope','failService', 
    function mainController($rootScope,$scope, failService) {
    
        // form data
        $scope.formData = {};

        // fails shown
        $scope.fails = {};
       
        // when landing on the page, get all fails and show them
        failService.getAll('approved')
            .success(function(data) {
                $scope.fails = data;
                console.log(data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });

        // when submitting the add form, send the text to the node API
        $scope.createFail = function() {
            failService.create($scope.formData)
                .success(function(data) {
                    $scope.formData = {}; // clear the form so our user is ready to enter another
                    $scope.fails = data;
                    console.log(data);
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        };

        // get all fails
        $scope.allFails = function(){
            failService.getAll('approved')
                .success(function(data) {
                    $scope.fails = data;
                    console.log(data);
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        }

        // get top 10 (best voted)
        $scope.top10 = function(){
            failService.getTop(10)
                .success(function(data) {
                    $scope.fails = data;
                    console.log(data);
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        }

        // increase like
        $scope.like = function(failid){
            failService.like(failid)
                .success(function(data) {                    
                    $scope.fails = data;
                    console.log(data);
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        };

        // increase dislike
        $scope.dislike = function(failid){
             failService.dislike(failid)
                .success(function(data) {                    
                    $scope.fails = data;
                    console.log(data);
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        };

    }

]);

firstdatefail.controller('adminController',['$scope','moderationService','failService',
    function adminController ($scope, moderationService, failService){
        $scope.fails = {};

        // when landing on the page, get all PENDING fails and show them
        failService.getAll('pending')  
            .success(function(data) {
                $scope.fails = data;
                console.log(data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });

        // approve a story
        $scope.approve = function(failid){
            moderationService.approve(failid)
                .success(function(data) {
                    // TODO: remove that fail from scope instead of reloading all scope
                    $scope.fails = data;
                    console.log(data);
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        };

        // reject a story
        $scope.reject = function(failid){
            moderationService.reject(failid)
                .success(function(data) {
                    // TODO: remove that fail from scope instead of reloading all scope
                    $scope.fails = data;
                    console.log(data);
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        };

    }
]);

firstdatefail.controller('loginController',['$rootScope','$scope','$location','$window','userService','authenticationService',
    function loginController($rootScope,$scope,$location,$window,userService,authenticationService){


        $scope.logIn = function logIn(username,password){
            if (username !== undefined && password !== undefined){
                userService.logIn(username, password).success(function(data){
                    console.log("logging in");
                    authenticationService.isLogged = true;
                    $window.sessionStorage.token = data.token;
                    $location.path("/admin");
                    $rootScope.isLogged = true;
                }).error(function(status,data){
                    console.log(status);
                    console.log(data);
                });
            }

        }
    }
]);

/*******************
*    SERVICES      *
********************/

firstdatefail.factory('failService', ['$http', function($http){

    return {
        create : function(failInfo){
            return $http.post('/api/fails/', failInfo);
        },

        like: function(failId){
            return $http.post('/api/like/' + failId);
        },

        dislike: function(failId){
            return $http.post('/api/dislike/' + failId);
        },

        getAll: function(status){
            // status can not be null or empty (because there is no /api/fails GET function)           
            return $http.get('/api/fails/' + status);            
        },

        getTop : function(nbOfFails){
            return $http.get('/api/fails/top/' + nbOfFails);
        }
    } 

}]);

firstdatefail.factory('moderationService', ['$http', function($http){

    return {
        
        approve: function(failId){
            return $http.post('/api/approve/' + failId);
        },

        reject: function(failId){
            return $http.post('/api/reject/' + failId);
        }
    } 

}]);

firstdatefail.factory('authenticationService', function(){
    var auth = {
        isLogged:false
    };
    return auth;
});

firstdatefail.factory('userService', ['$http', function($http){
    return {
        logIn : function (username, password){
            return $http.post('/api/login',{username:username,password:password});
        },
        logOut : function (){
            // nothing at the moment!?
        }
    }
}]);

firstdatefail.factory('tokenInterceptor', ['$rootScope','$q','$window','$location','authenticationService', 
    function ($rootScope,$q,$window,$location,authenticationService){
        return {
            request: function(config){
                config.headers = config.headers || {};
                if ($window.sessionStorage.token){
                    config.headers.Authorization = 'Bearer ' + $window.sessionStorage.token;
                }
                return config;
            },

            requestError: function(rejection){
                return $q.reject(rejection);
            },

            /* Set Authentication.isAuthenticated to true if 200 received */
            response : function(response){
                if (response != null && response.status == 200 && $window.sessionStorage.token && !authenticationService.isLogged) {
                    authenticationService.isLogged = true;
                    $rootScope.isLogged = true;
                }
                return response || $q.when(response);
            },
           

            /* Revoke client authentication if 401 Unauthorized is received */
            responseError : function(rejection){
                if (rejection != null && rejection.status === 401 && ($window.sessionStorage.token || authenticationService.isLogged)) {
                    delete $window.sessionStorage.token;
                    AuthenticationService.isLogged = false;
                    $rootScope.isLogged = false;
                    $location.path("/login");
                }

                return $q.reject(rejection);
            }


        }
    }
]);
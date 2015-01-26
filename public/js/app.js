var firstdatefail = angular.module('firstdatefail', []);

/**********************
*    CONTROLLERS      *
**********************/

firstdatefail.controller('mainController',['$scope','failService', 
    function mainController($scope, failService) {
    
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
])

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
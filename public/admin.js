var firstdatefail = angular.module('firstdatefail', []);

function mainController($scope, $http) {
    $scope.formData = {};

    // when landing on the page, get all PENDING fails and show them
    $http.get('/api/fails/pending')
        .success(function(data) {
            $scope.fails = data;
            console.log(data);
        })
        .error(function(data) {
            console.log('Error: ' + data);
        });

    // when submitting the add form, send the text to the node API
    $scope.createFail = function() {
        $http.post('/api/fails', $scope.formData)
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
        $http.get('/api/fails')
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
        $http.get('/api/fails/top10')
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
        $http.post('/api/like/' + failid)
            .success(function(data) {
                $scope.formData = {}; // clear the form so our user is ready to enter another
                $scope.fails = data;
                console.log(data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
    };

    // increase dislike
    $scope.dislike = function(failid){
        $http.post('/api/dislike/' + failid)
            .success(function(data) {
                $scope.formData = {}; // clear the form so our user is ready to enter another
                $scope.fails = data;
                console.log(data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
    };


}
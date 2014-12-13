var firstdatefail = angular.module('firstdatefail', []);

function mainController($scope, $http) {
    $scope.formData = {};

    // when landing on the page, get all fails and show them
    $http.get('/api/fails')
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

    // increase votations
    $scope.voteUp = function(failid){
        $http.post('/api/voteup/' + failid)
            .success(function(data) {
                $scope.formData = {}; // clear the form so our user is ready to enter another
                $scope.fails = data;
                console.log(data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });


    }
}
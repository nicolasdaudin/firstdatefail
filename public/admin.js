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


    // approve a story
    $scope.approve = function(failid){
        $http.post('/api/approve/' + failid)
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
        $http.post('/api/reject/' + failid)
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
// app.service.js

app.factory('GameService', ['$http', function($http) {
    var baseUrl = '/api/Game';

    return {
        getRandomNumberList: function() {
            return $http.get(baseUrl + '/randomList');
        },
        evaluateCombination: function(combination, randomNumberList) {
            return $http.post(baseUrl + '/evaluateCombination', { combination: combination, randomNumberList: randomNumberList });
        },
        getAICombinations: function(targetNumber, randomNumberList) {  // nouvelle méthode
            return $http.post(baseUrl + '/getAICombinations', { targetNumber: targetNumber, randomNumberList: randomNumberList });
        }
    };
}]);
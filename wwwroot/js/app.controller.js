app.controller('GameController', ['$scope', '$interval', 'GameService', function($scope, $interval, GameService) {
    $scope.randomNumber = null;
    $scope.randomNumberList = [];

    $scope.targetNumber = null;

    $scope.player1Number = null;
    $scope.player2Number = null;

    $scope.player1Submitted = false;
    $scope.player2Submitted = false;

    $scope.winner = null;

    $scope.combinationInputVisible = false;
    $scope.combination = "";

    $scope.actualWinner = null;

    $scope.timeLeft = 30;           // timer set to 30 seconds
    $scope.timerRunning = false;

    let timer;
    let firstSubmitter = null;      // track who submitted first

    // retrieve the random number from backend and start the game
    $scope.getRandomNumberList = function() {
        GameService.getRandomNumberList().then(function(response) {
            $scope.randomNumber = response.data.randomNumber;
            $scope.randomNumberList = response.data.randomNumberList;

            console.log('Random Number List:', $scope.randomNumberList);

            $scope.targetNumber = $scope.randomNumber;

            $scope.combinationInputVisible = false;
            $scope.actualWinner = null;

            $scope.winner = null;

            $scope.player1Number = null;
            $scope.player2Number = null;

            $scope.player1Submitted = false;
            $scope.player2Submitted = false;

            $scope.combination = "";
            firstSubmitter = null;     // reset first submitter

            $scope.startTimer();
        }, function(error) {
            console.error('Error fetching random number list:', error);
        });
    };

    // handle timer functionality
    $scope.startTimer = function() {
        $scope.timeLeft = 30;
        $scope.timerRunning = true;
        if (angular.isDefined(timer)) $interval.cancel(timer);

        timer = $interval(function() {

            // timer still running
            if ($scope.timeLeft > 0) {
                $scope.timeLeft--;    // decrease timer (compte à rebours)  
            } 
            
            // time is up
            else {
                $scope.stopTimer();  
                $scope.checkTimeout();
            }
        }, 1000);
    };

    // stop timer 
    $scope.stopTimer = function() {
        if (angular.isDefined(timer)) {
            $interval.cancel(timer);
            $scope.timerRunning = false;
        }
    };

    // handle player 1 submit
    $scope.submitPlayer1 = function() {
        $scope.player1Submitted = true;
        if (firstSubmitter === null) firstSubmitter = 'Player 1';
        $scope.checkWinner();
    };

    // handle player 2 submit
    $scope.submitPlayer2 = function() {
        $scope.player2Submitted = true;
        if (firstSubmitter === null) firstSubmitter = 'Player 2';
        $scope.checkWinner();
    };

    // handle event when the timer is up
    $scope.checkTimeout = function() {
        if (!$scope.player1Submitted && !$scope.player2Submitted) {
            $scope.actualWinner = 'Time is up! No winner.';
        } else if (!$scope.player1Submitted) {
            $scope.actualWinner = 'Time is up! Player 2 wins because Player 1 did not submit a number.';
        } else if (!$scope.player2Submitted) {
            $scope.actualWinner = 'Time is up! Player 1 wins because Player 2 did not submit a number.';
        }
    };

    // winner manager
    $scope.checkWinner = function() {
        if ($scope.player1Submitted && $scope.player2Submitted && $scope.targetNumber !== null) {
            $scope.stopTimer();     // when all players have submitted, stop the timer

            // calculate difference from target number 
            let diff1 = Math.abs($scope.targetNumber - $scope.player1Number);
            let diff2 = Math.abs($scope.targetNumber - $scope.player2Number);

            // player 1 has the closest number 
            if (diff1 < diff2) {
                $scope.winner = 'Player 1';
                $scope.combinationInputVisible = true;      // show input to insert combination
            } 

            // player 2 has the closest number             
            else if (diff2 < diff1) {
                $scope.winner = 'Player 2';
                $scope.combinationInputVisible = true;      // show input to insert combination
            } 
            
            // same number
            else {
                $scope.winner = firstSubmitter;             // set winner to the first submitter
                $scope.combinationInputVisible = true;      // show input to insert combination
            }
        }
    };

    // retrieve the combination from the input
    $scope.updateCombination = function(combination) {
        $scope.combination = combination;
    };

    // handle combination
    $scope.checkCombination = function() {
        let expression = $scope.combination;

        if (!expression || expression.trim() === '') {
            $scope.actualWinner = 'Expression is empty. Please enter a valid combination.';
            return;
        }

        // extract numbers from the expression
        let numbers = expression.match(/\d+/g).map(Number);

        console.log('Combination:', expression);
        console.log('Extracted Numbers:', numbers);

        // count occurrences of each number in the random number list
        let numberCounts = {};
        $scope.randomNumberList.forEach(num => {
            numberCounts[num] = (numberCounts[num] || 0) + 1;
        });

        console.log('Number Counts in Random List:', numberCounts);

        // check if all numbers are in the random number list with correct counts
        let allNumbersValid = true;
        let usedNumberCounts = {};

        numbers.forEach(num => {
            usedNumberCounts[num] = (usedNumberCounts[num] || 0) + 1;
            if (usedNumberCounts[num] > (numberCounts[num] || 0)) {
                allNumbersValid = false;
            }
        });

        console.log('Used Number Counts:', usedNumberCounts);

        // the player has used a number outside of the list or more times than it appears
        if (!allNumbersValid) {
            $scope.actualWinner = 'Invalid combination because of using invalid numbers or more times than they appear, ' + ($scope.winner === 'Player 1' ? 'Player 2' : 'Player 1') + ' wins!';
            return;
        }

        try {
            let result = eval(expression);      // evaluate combination
            let winnerNumber = $scope.winner === 'Player 1' ? $scope.player1Number : $scope.player2Number;      // get the closest number

            if (result === winnerNumber) {
                $scope.actualWinner = 'Valid combination, ' + $scope.winner + ' is the winner!';
            } else {
                $scope.actualWinner = 'Incorrect combination, ' + ($scope.winner === 'Player 1' ? 'Player 2' : 'Player 1') + ' wins due to wrong combination';
            }

            console.log('Combination Result:', result);
        } catch (e) {
            console.error('Combination evaluation error:', e);
            $scope.actualWinner = 'Invalid combination.';
        }
    };
}]);
// app.controller.js

app.controller('GameController', ['$scope', '$interval', 'GameService', function($scope, $interval, GameService) {
    $scope.randomNumber = null;
    //$scope.randomNumberList = Array(7).fill(null); // Array to hold 7 random numbers
    $scope.randomNumberList = [78, 4, 7, 5, 26, 35, 4];
    
    $scope.combinations = []; // IA combinations

    $scope.targetNumber = null;

    $scope.player1Number = null;
    $scope.player2Number = null;

    $scope.player1Submitted = false;
    $scope.player2Submitted = false;

    $scope.winner = null;

    $scope.combinationInputVisible = false;
    $scope.combination = "";

    $scope.actualWinner = null;

    $scope.timeLeft = 60; // timer set to 60 seconds

    $scope.timerRunning = false;

    $scope.randomNumbersVisible = false; // Variable to control visibility of random numbers
    $scope.targetNumberVisible = false; // Variable to control visibility of target number

    $scope.isPlayerVsIA = false; // Variable to track if the game is against IA

    let timer;
    let firstSubmitter = null; // track who submitted first

    // function to validate numbers in the list
    const validateRandomNumbers = (numbers) => {
        return numbers.every(num => num >= 1 && num <= 100);
    };

    // function to validate the target number
    const validateTargetNumber = (number) => {
        return number >= 1 && number <= 1000;
    };

    // retrieve the random number from backend and start the game
    $scope.startGame = function(mode) {
        if (!validateRandomNumbers($scope.randomNumberList)) {
            alert("All random numbers must be between 1 and 100.");
            return;
        }

        if (!validateTargetNumber($scope.randomNumber)) {
            alert("The target number must be between 1 and 1000.");
            return;
        }

        $scope.targetNumber = $scope.randomNumber;
        $scope.combinationInputVisible = false;
        $scope.actualWinner = null;
        $scope.winner = null;

        $scope.player1Number = null;
        $scope.player2Number = null;

        $scope.player1Submitted = false;
        $scope.player2Submitted = false;

        $scope.combination = "";
        firstSubmitter = null; // reset first submitter

        $scope.randomNumbersVisible = true; // Show random numbers
        $scope.targetNumberVisible = true; // Show target number
        $scope.isPlayerVsIA = (mode === 'PVI'); // Set the game mode

        $scope.startTimer();

        if ($scope.isPlayerVsIA) {

            // call backend to get AI's combinations
            GameService.getAICombinations($scope.targetNumber, $scope.randomNumberList).then(function(response) {
                console.log('AI Combinations Response:', response.data); // debug
                $scope.combinations = response.data.map(item => ({
                    value: item.value,
                    expression: item.expression
                }));

                $scope.player2Number = $scope.combinations[0].value;
                $scope.submitPlayer2();
            });            
        }
    };

    // handle timer functionality
    $scope.startTimer = function() {
        $scope.timeLeft = 60;

        console.log("Time left: " + $scope.timeLeft);

        $scope.timerRunning = true;
        if (angular.isDefined(timer)) $interval.cancel(timer);

        timer = $interval(function() {
            // timer still running
            if ($scope.timeLeft > 0) {
                $scope.timeLeft--; // decrease timer (compte à rebours)
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
        if ($scope.player1Number === null || $scope.player1Number === undefined) {
            alert("Player 1 must enter a number before submitting.");
            return;
        }
        $scope.player1Submitted = true;
        if (firstSubmitter === null) firstSubmitter = 'Player 1';
        $scope.checkWinner();
    };

    // handle player 2 submit with AI combination logic
    $scope.submitPlayer2 = function() {
        if ($scope.player2Number === null || $scope.player2Number === undefined) {
            alert("Player 2 must enter a number before submitting.");
            return;
        }
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
            $scope.stopTimer();         // when all players have submitted, stop the timer

            // calculate difference from target number
            let diff1 = Math.abs($scope.targetNumber - $scope.player1Number);
            let diff2 = Math.abs($scope.targetNumber - $scope.player2Number);

            if (diff1 < diff2) {
                $scope.winner = 'Player 1';
                $scope.combinationInputVisible = true; // show input to insert combination
            } 
            
            else if (diff2 < diff1) {
                $scope.winner = 'Player 2';
                $scope.combinationInputVisible = true; // show input to insert combination

                if ($scope.isPlayerVsIA) {
                    // Fetch AI combination if AI is the winner
                    GameService.getAICombination($scope.targetNumber, $scope.randomNumberList).then(function(response) {
                        console.log('AI Combination Response:', response.data); // debug
                        $scope.combination = response.data.combination;
                        $scope.checkCombination(); // auto-submit the combination for AI
                    });
                }
            } 
            
            else {
                $scope.winner = firstSubmitter;         // set winner to the first submitter
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
            let result = eval(expression); // evaluate combination
            let winnerNumber = $scope.winner === 'Player 1' ? $scope.player1Number : $scope.player2Number; // get the closest number

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
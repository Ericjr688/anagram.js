let currentTargetWord = "";
let correctGuesses = [];
let currentScore = 0;
let currentIncorrectGuesses = 0;

document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("newGameBtn").addEventListener("click", function() {
        // Reset the game state for a new game
        clearGame();
        getRandomWord(setUpNewGame);
    });

    document.getElementById("shuffleBtn").addEventListener("click", function() {
        // Shuffle the letters in the current word
        let lettersElement = document.getElementById("letters");
        let currentWord = lettersElement.innerText;
        let shuffledWord = shuffleString(currentWord);
        // Update the displayed letters with the shuffled word
        lettersElement.innerText = shuffledWord;
    })

    document.getElementById('guessForm').addEventListener('submit', async function(event) {
        event.preventDefault();
        await handleGuessSubmission();
    });

    document.getElementById("clearHistoryBtn").addEventListener("click", function() {
        // Clear the game history
        clearHistory();
    });

    // Initialize the game when the DOM is fully loaded
    clearGame();
    loadHistory();
    getRandomWord(setUpNewGame);
});

function setUpNewGame(wordObj) {
    if (wordObj && wordObj.word) {
        let targetWord = wordObj.word;
        let shuffledWord = shuffleString(targetWord);

        document.getElementById("letters").innerText = shuffledWord;
        currentTargetWord = targetWord.toLowerCase(); // Store the target word
    } else {
        console.error("Invalid word object received:", wordObj);
    }
}

function clearGame() {
    document.getElementById("letters").innerText = "";
    document.getElementById("score").innerText = "0";
    document.getElementById("guessInput").value = "";
    document.getElementById("feedback").textContent = ""; 

    // clear list of correct guesses
    let correctGuessesList = document.getElementById("correctList");
    while (correctGuessesList.firstChild) {
        correctGuessesList.removeChild(correctGuessesList.firstChild);
    } 
    
    document.getElementById('letters').style.display = "";
    document.getElementById('correctList').style.display = "";
    document.getElementById('guessForm').style.display = "";
    document.getElementById('submitGuess').disabled = false;
    document.getElementById('shuffleBtn').disabled = false;
    
    correctGuesses = [];
    currentScore = 0;
    currentIncorrectGuesses = 0;
}

async function handleGuessSubmission() {
    let guessInput = document.getElementById('guessInput');
    let feedbackElem = document.getElementById('feedback');
    let guess = guessInput.value.trim().toLowerCase();

    // Check if input is non-empty
    if (guess.length === 0) {
        feedbackElem.textContent = "Please enter a word.";
        return;
    }

    if (guess.length > currentTargetWord.length) {
        feedbackElem.textContent = "Invalid guess: The word is too long.";
        currentIncorrectGuesses += 1;
        return;
    }

    // Check if the guess is the same as the target word
    let targetFreq = letterFrequency(currentTargetWord);
    let guessFreq = letterFrequency(guess);

    for (let letter in guessFreq) {
        if (!targetFreq[letter] || guessFreq[letter] > targetFreq[letter]) {
            feedbackElem.textContent = `Invalid guess: The letter "${letter}" is either not in the target word or used too many times.`;
            currentIncorrectGuesses += 1;
            return;
        }
    }

    if (correctGuesses.includes(guess)) {
        feedbackElem.textContent = "You already guessed that word.";
        guessInput.value = "";
        currentIncorrectGuesses += 1;
        return;
    }

    // Check if the guess is a valid dictionary word
    // if it is a 7 letter word, do not check the dictionary
    
    if (guess.length === 7) {
        if (guess === currentTargetWord) {
            feedbackElem.textContent = "Congratulations! You guessed the target word.";
            updateGameStats(currentScore, correctGuesses.length, currentIncorrectGuesses);

            // hide target letters and guessed words for this game
            document.getElementById('letters').style.display = "none";
            document.getElementById('correctList').style.display = "none";

            // disable the submission and randomize buttons
            document.getElementById('submitGuess').disabled = true;
            document.getElementById('shuffleBtn').disabled = true;
        } else {
            feedbackElem.textContent = "You guessed a valid 7-letter word, but it is not the target word."; 
            guessInput.value = "";
            return;
        }
    } else {
        feedbackElem.textContent = "Checking dictionary...";
        try {
            let dictResult = await checkDictionaryWord(guess);
            if (dictResult.valid) {
                feedbackElem.textContent = "Valid guess!";

                // Update correct guesses
                correctGuesses.push(guess);
                addGuessToList(guess);

                // Update score
                let points = getScoreForWord(guess);
                currentScore += points;
                document.getElementById('score').textContent = currentScore;
    
            } else {
                feedbackElem.textContent = "Invalid dictionary word.";
                currentIncorrectGuesses += 1;
            }
        } catch (error) {
            feedbackElem.textContent = "Error checking word in dictionary.";
            console.error(error);
        }
    }
    guessInput.value = "";
}


function addGuessToList(guess) {
    const correctList = document.getElementById('correctList');
    const li = document.createElement('li');
    li.textContent = guess;
    li.className = "list-group-item";
    correctList.prepend(li);
}


function updateGameStats(finalScore, correctCount, incorrectCount) {
    // Retrieve the existing stats from localStorage or initialize them if not present.
    let stats = JSON.parse(localStorage.getItem("gameStats"));
    if (!stats) {
        stats = {
            gamesPlayed: 0,
            highScore: 0,
            lowScore: Infinity,
            totalCorrectGuesses: 0,
            totalIncorrectGuesses: 0
        };
    }

    // Update the stats with the current game data.
    stats.gamesPlayed++;

    stats.highScore = Math.max(stats.highScore, finalScore);
    stats.lowScore = stats.lowScore === Infinity ? finalScore : Math.min(stats.lowScore, finalScore);
    stats.totalCorrectGuesses += correctCount;
    stats.totalIncorrectGuesses += incorrectCount;

    localStorage.setItem("gameStats", JSON.stringify(stats));

    document.getElementById("gamesPlayed").textContent = stats.gamesPlayed;
    document.getElementById("highScore").textContent = stats.highScore;
    document.getElementById("lowScore").textContent = stats.lowScore;

    document.getElementById("avgCorrect").textContent = (stats.totalCorrectGuesses / stats.gamesPlayed).toFixed(1);
    document.getElementById("avgIncorrect").textContent = (stats.totalIncorrectGuesses / stats.gamesPlayed).toFixed(1);
}

async function checkDictionaryWord(word) {
    let response = await fetch('https://cs4640.cs.virginia.edu/homework/checkword.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ word: word })
    });
    console.log(response);
    let result = await response.json();
    return result;
}

function clearHistory() {
    // clear stats from localStorage
    localStorage.removeItem("gameStats");
    document.getElementById("gamesPlayed").textContent = 0;
    document.getElementById("highScore").textContent = 0;
    document.getElementById("lowScore").textContent = 0;

    document.getElementById("avgCorrect").textContent = 0;
    document.getElementById("avgIncorrect").textContent = 0;
}

function loadHistory() {
    // load game stats from ui if present
    let stats = JSON.parse(localStorage.getItem("gameStats"));
    if (!stats) {
        stats = {
            gamesPlayed: 0,
            highScore: 0,
            lowScore: Infinity,
            totalCorrectGuesses: 0,
            totalIncorrectGuesses: 0
        };
    }
    
    document.getElementById("gamesPlayed").textContent = stats.gamesPlayed;
    document.getElementById("highScore").textContent = stats.highScore;
    document.getElementById("lowScore").textContent = stats.lowScore;

    document.getElementById("avgCorrect").textContent = (stats.totalCorrectGuesses / stats.gamesPlayed).toFixed(1);
    document.getElementById("avgIncorrect").textContent = (stats.totalIncorrectGuesses / stats.gamesPlayed).toFixed(1);
}



// Helper Functions ------------------------------------------
// Gets the frequency of letters in a string
function letterFrequency(str) {
    let freq = {};
    for (let char of str) {
        freq[char] = (freq[char] || 0) + 1;
    }
    return freq;
}

// Shuffles the letters in a string
// https://stackoverflow.com/questions/2450954/adding-a-method-to-shuffle-an-array-in-javascript
function shuffleString(str) {
    let array = str.split('');
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array.join('');
}

function getScoreForWord(word) {
    switch (word.length) {
        case 1:
            return 1;
        case 2:
            return 2;
        case 3:
            return 4;
        case 4:
            return 8;
        case 5:
            return 15;
        case 6:
            return 30;
        default:
            return 0;
    }
}


console.log("Game logic loaded.");
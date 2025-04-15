let currentTargetWord = "";
let correctGuesses = [];

document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("newGameBtn").addEventListener("click", function() {
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
    // Initialize the game when the DOM is fully loaded
    getRandomWord(setUpNewGame);
});

function setUpNewGame(wordObj) {
    if (wordObj && wordObj.word) {
        let targetWord = wordObj.word;
        let shuffledWord = shuffleString(targetWord);

        clearGame(); // Clear previous game state
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
    correctGuesses = [];
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
        return;
    }

    // Check if the guess is the same as the target word
    let targetFreq = letterFrequency(currentTargetWord);
    let guessFreq = letterFrequency(guess);

    for (let letter in guessFreq) {
        if (!targetFreq[letter] || guessFreq[letter] > targetFreq[letter]) {
            feedbackElem.textContent = `Invalid guess: The letter "${letter}" is either not in the target word or used too many times.`;
            return;
        }
    }

    if (correctGuesses.includes(guess)) {
        feedbackElem.textContent = "You already guessed that word.";
        guessInput.value = "";
        return;
    }

    // Check if the guess is a valid dictionary word
    feedbackElem.textContent = "Checking dictionary...";
    try {
        let dictResult = await checkDictionaryWord(guess);
        if (dictResult.valid) {
            feedbackElem.textContent = "Valid guess!";
            correctGuesses.push(guess);
            addGuessToList(guess);
            // Update score and correct guesses
        } else {
            feedbackElem.textContent = "Invalid dictionary word.";
        }
    } catch (error) {
        feedbackElem.textContent = "Error checking word in dictionary.";
        console.error(error);
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


async function checkDictionaryWord(word) {
    let response = await fetch('https://cs4640.cs.virginia.edu/homework/checkword.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ word: word })
    });
    let result = await response.json();
    return result;
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


console.log("Game logic loaded.");
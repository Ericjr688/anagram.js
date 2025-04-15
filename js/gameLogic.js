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
    // Initialize the game when the DOM is fully loaded
    getRandomWord(setUpNewGame);
});

function shuffleString(str) {
    let array = str.split('');
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array.join('');
}

function setUpNewGame(wordObj) {
    if (wordObj && wordObj.word) {
        let targetWord = wordObj.word;
        let shuffledWord = shuffleString(targetWord);

        clearGame(); // Clear previous game state
        document.getElementById("letters").innerText = shuffledWord;
    } else {
        console.error("Invalid word object received:", wordObj);
    }
}

function clearGame() {
    document.getElementById("letters").innerText = "";
    document.getElementById("score").innerText = "0";
    document.getElementById("guessInput").value = ""; 

    // clear list of correct guesses
    let correctGuessesList = document.getElementById("correctList");
    while (correctGuessesList.firstChild) {
        correctGuessesList.removeChild(correctGuessesList.firstChild);
    }  
}

console.log("Game logic loaded.");
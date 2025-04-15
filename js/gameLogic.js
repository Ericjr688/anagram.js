document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("newGameBtn").addEventListener("click", function() {
        getRandomWord(setUpNewGame);
    });

    document.getElementById("shuffleBtn").addEventListener("click", function() {
        let lettersElement = document.getElementById("letters");
        let currentWord = lettersElement.innerText;
        let shuffledWord = shuffleString(currentWord);
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

        document.getElementById("letters").innerText = shuffledWord;
        document.getElementById("score").innerText = "0";
    } else {
        console.error("Invalid word object received:", wordObj);
    }
}

console.log("Game logic loaded.");
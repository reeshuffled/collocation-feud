// DOM element references
const wordEl = document.getElementById("word");
const inputEl = document.getElementById("guessInput");
const boardEl = document.getElementById("board");
const tryAgainBtn = document.getElementById("tryAgain");
const shareBtn = document.getElementById("share");
const newWordBtn = document.getElementById("newWord");
const friendScoreEl = document.getElementById("friendScore");
const scoreEl = document.getElementById("score");

// keep track of user score and friend score
let currentWord;
let userScore = 0;
let friendScore;

/**
 * Initalize the UI components of the game.
 */
(async function initUI() {
    // load the collocation data
    const response = await fetch("data.json");
    const data = await response.json();

    // check if there are search parameters in the URL
    const queryString = window.location.search;
    if (queryString) 
    {
        // get word and score from word
        const urlParams = new URLSearchParams(queryString);
        const word = urlParams.get("word");
        const score = urlParams.get("score");

        // if the score is a number, store it under friendScore
        if (!isNaN(score))
        {
            friendScore = parseFloat(score);
        }

        // if the word is a valid word, play it
        if (word && word in data)
        {
            displayWord(data, word, friendScore);
        }
        // otherwise display a random word
        else
        {
            selectRandomWord(data);
        }
    }
    // if there are none, jiust choose a random
    else
    {
        // select a random word when the data loads
        selectRandomWord(data);
    }

    // bind button click actions
    tryAgainBtn.onclick = resetGuesses;
    shareBtn.onclick = share;
    newWordBtn.onclick = () => getNewWord(data);
})();

/**
 * Get a new word.
 * @param {Object} data 
 */
function getNewWord(data) {
    // reset guesses
    resetGuesses();

    // reset friendScore
    friendScore = 0;
    updateSearchParam("score", "");
    friendScoreEl.parentNode.style.display = "none";

    // get new random word
    selectRandomWord(data);
}

/**
 * Display a particular word.
 * @param {Object} data 
 * @param {String} word 
 * @param {Number} score 
 */
function displayWord(data, word, score) {
    // clear the board and score
    resetGuesses();

    // display the word to user
    currentWord = word;
    wordEl.innerText = word;
    
    // bind the guess word function to the enter key on input element
    bindGuess(data[word]);

    // if there is a friend score in the URL, display it
    if (score && !isNaN(score))
    {
        // display friend score
        friendScoreEl.parentNode.style.display = "";

        // set friend score to whatever it was from the URL
        friendScoreEl.innerText = parseFloat(score).toFixed(2);
    }
}

/**
 * Select a random word from the dataset to show.
 * @param {Object[]} data 
 */
function selectRandomWord(data) {
    // clear the board and score
    resetGuesses();
    
    // get random word
    const key = Object.keys(data)[Math.floor(Math.random() * Object.keys(data).length)];
    
    // display word to user
    currentWord = key;
    wordEl.innerText = key;

    // bind the guess word function to the enter key on input element
    bindGuess(data[key]);

    // update the word URL search parameter for better sharing
    updateSearchParam("word", key);
}

/**
 * Share the link to the word and user score.
 */
function share() {
    // if the user is in mobile, we can use the Share API
    if (navigator.share)
    {
        navigator.share({
            title: "Collocation Feud",
            text: `Play against me in Collocation Feud! The word is: ${currentWord}`,
            url: window.location.href
        });
    }
    // otherwise, we will just copy to the clipboard
    else
    {
        const text = `Play against me in Collocation Feud! The word is: ${currentWord}\n${window.location.href}`;

        navigator.clipboard.writeText(text)
            .then(() => alert("Share URL copied to clipboard successfully!"));
    }
}

/**
 * Update a URL search parameter without reloading the page.
 * From: https://stackoverflow.com/questions/5999118/how-can-i-add-or-update-a-query-string-parameter
 * @param {String} param 
 * @param {String} value 
 */
function updateSearchParam(param, value) {
    // create search parameters object
    const searchParams = new URLSearchParams(window.location.search);

    // encode the word to be URL safe and set as URL search parameter
    searchParams.set(param, encodeURIComponent(value));

    // use history API to not cause page reload on URL search parameter change
    const newRelativePathQuery = window.location.pathname + "?" + searchParams.toString();
    history.pushState(null, "", newRelativePathQuery);
}

/**
 * Reset the guess board and user score.
 */
function resetGuesses() {
    // clear the guesses table
    [...board.querySelectorAll("td")].forEach(x => x.innerText = "");

    // reset the user score
    userScore = 0;
    scoreEl.innerText = userScore.toFixed(2);
}

/**
 * Check the word frequency data for the user's guess and update the guess board 
 * and/or the score.
 * @param {Object[]} data 
 * @param {String} guess
 */
function guessWord(data, guess) {
    // get the user's guess and find it was in the collocation corpus
    const hit = data.find(x => x.assoc == guess);

    // check if the table is full or not
    const nextEmptyCell = [...board.querySelectorAll("td")].find(x => x.innerText == "");
    if (nextEmptyCell)
    {
        if (hit)
        {
            // show the guess and the collocation frequency
            nextEmptyCell.innerHTML = `
                ${guess} <span style="float: right">${hit.freq}</span>
            `;

            // increase the score display
            userScore += parseFloat(hit.freq);
            scoreEl.innerText = userScore.toFixed(2);
        }
        else
        {
            // show the guess with an X next to it to show the user that the guess was incorrect
            nextEmptyCell.innerHTML = `
                ${guess} <span style="float: right">X</span>
            `;
        }

        // if that was last guess
        if (![...board.querySelectorAll("td")].find(x => x.innerText == ""))
        {
            // if you beat your friend score, show confetti
            if (userScore > friendScore)
            {
                const jsConfetti = new JSConfetti();

                jsConfetti.addConfetti({
                    emojis: ["🎉", "🏆"]
                });
            }
        }
    }

    // clear the guess input
    inputEl.value = "";
}

/**
 * On input keydown, do the guess checking function for that word.
 * @param {Object[]} data 
 */
function bindGuess(data) {
    inputEl.onkeydown = e => {
        // get the user guess from the input
        const guess = inputEl.value.toLowerCase();

        // on enter keydown
        if (e.key == "Enter")
        {
            // make sure that the input has characters in order to guess
            if (guess)
            {
                guessWord(data, guess);
            }
        }
    }
}
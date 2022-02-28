// DOM element references
const wordEl = document.getElementById("word");
const inputEl = document.getElementById("guessInput");
const boardEl = document.getElementById("board");
const tryAgainBtn = document.getElementById("tryAgain");
const shareBtn = document.getElementById("share");
const newWordBtn = document.getElementById("newWord");
const friendScoreEl = document.getElementById("friendScore");
const scoreEl = document.getElementById("score");

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
        const urlParams = new URLSearchParams(queryString);

        const word = urlParams.get("word");
        const score = urlParams.get("score");

        // if there is a word 
        if (word)
        {
            displayWord(data, word, score);
        }
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
    newWordBtn.onclick = () => selectRandomWord(data);
})();

/**
 * Display a particular word.
 * @param {Object} data 
 * @param {String} word 
 * @param {Number} score 
 */
function displayWord(data, word, score) {
    // clear the board and score
    resetGuesses();

    // if the word is not in the word list, just choose a random one
    if (!(word in data))
    {
        selectRandomWord(data);

        return;
    }

    // display the word to user
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
    wordEl.innerText = key;

    // bind the guess word function to the enter key on input element
    bindGuess(data[key]);

    // update the word URL search parameter for better sharing
    updateSearchParam("word", key);
    updateSearchParam("score", "");
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
            text: "Play against me in Collocation Feud!",
            url: window.location.href
        });
    }
    // otherwise, we will just copy to the clipboard
    else
    {
        navigator.clipboard.writeText(window.location.href)
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

    // reset the score
    scoreEl.innerText = "0.00";
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
            scoreEl.innerText = (parseFloat(scoreEl.innerText) + parseFloat(hit.freq)).toFixed(2);
        }
        else
        {
            // show the guess with an X next to it to show the user that the guess was incorrect
            nextEmptyCell.innerHTML = `
                ${guess} <span style="float: right">X</span>
            `;
        }

        // update the score parameter so it can be shared
        updateSearchParam("score", scoreEl.innerText);
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
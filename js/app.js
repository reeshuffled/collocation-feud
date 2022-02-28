// DOM element references
const wordEl = document.getElementById("word");
const inputEl = document.getElementById("guessInput");
const boardEl = document.getElementById("board");
const newWordBtn = document.getElementById("newWord");
const scoreEl = document.getElementById("score");

/**
 * Initalize the UI components of the game.
 */
(async function initUI() {
    // load the collocation data
    const response = await fetch("data.json");
    const data = await response.json();

    // select a random word when the data loads
    selectRandomWord(data);

    newWordBtn.onclick = () => selectRandomWord(data);
})();

/**
 * Select a random word from the dataset to show.
 * @param {Object[]} data 
 */
function selectRandomWord(data) {
    // clear the guesses table
    [...board.querySelectorAll("td")].forEach(x => x.innerText = "");
    
    // reset the score
    scoreEl.innerText = "0.00";
    
    // get random word
    const key = Object.keys(data)[Math.floor(Math.random() * Object.keys(data).length)];
    
    // display word to user
    wordEl.innerText = key;

    // bind the guess word function to the enter key on input element
    inputEl.onkeydown = e => {
        if (e.key == "Enter")
        {
            guessWord(data[key]);
        }
    }
}

/**
 * 
 * @param {Object[]} data 
 */
function guessWord(data) {
    // get the user's guess and find it was in the collocation corpus
    const guess = inputEl.value.toLowerCase();
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
    }

    // clear the guess input
    inputEl.value = "";
}

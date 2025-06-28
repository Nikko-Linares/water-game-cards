// List of emojis to use as card faces
const emojis = ['💧','🌊','🚰','🫧','💦','🧊','🪣','🦆','🌧️','🛁','🧽','🫗','🪥','🧴','🧼'];

// Game state variables
let cards = [];            // Array to hold card objects
let flippedCards = [];     // Currently flipped cards (max 2)
let matchedCount = 0;      // Number of matched cards
let score = 0;             // Number of attempts
let timer = 0;             // Time elapsed in seconds
let timerInterval = null;  // Interval ID for timer
let gameStarted = false;   // Has the game started?
let isChecking = false;    // Is the game checking for a match?
let flipBackTimeout = null;// Timeout ID for flipping cards back

// DOM elements
const board = document.getElementById('game-board');           // Game board container
const scoreSpan = document.getElementById('score');            // Score display
const timerSpan = document.getElementById('timer');            // Timer display
const restartBtn = document.getElementById('restart-btn');     // Restart button
const difficultySelect = document.getElementById('difficulty');// Difficulty dropdown
const startBtn = document.getElementById('start-btn');         // Start button
const gameInfo = document.querySelector('.game-info');         // Game info bar
const difficultyDiv = document.querySelector('.difficulty-select'); // Difficulty selection bar

let currentDifficulty = 'medium'; // Default difficulty

// Settings for each difficulty level
const difficultySettings = {
    easy: { size: 2, pairs: 2 },    // 2x2 = 4 cards (2 pairs)
    medium: { size: 4, pairs: 8 },  // 4x4 = 16 cards (8 pairs)
    hard: { size: 6, pairs: 18 }    // 6x6 = 36 cards (18 pairs)
};

// Fisher-Yates shuffle to randomize an array
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Create the game board based on the selected difficulty
function createBoard() {
    board.innerHTML = ''; // Clear previous board
    board.className = `game-board ${currentDifficulty}`; // Set board size class

    // Get board size and number of pairs for current difficulty
    const { size, pairs } = difficultySettings[currentDifficulty];

    // Select emojis and duplicate them for pairs
    let emojiPairs = shuffle([...emojis].slice(0, pairs));
    emojiPairs = [...emojiPairs, ...emojiPairs];

    // If odd number of cards, add one extra emoji
    if (size * size % 2 !== 0) {
        emojiPairs.push(emojis[pairs]);
    }

    // Shuffle and trim to fit the board size
    emojiPairs = shuffle(emojiPairs).slice(0, size * size);

    // Reset game state
    cards = [];
    matchedCount = 0;
    score = 0;
    scoreSpan.textContent = `Score: 0`;

    // Create card elements and add to the board
    emojiPairs.forEach((emoji, idx) => {
        const card = document.createElement('div');
        card.className = 'card flipped'; // Start face down
        card.dataset.index = idx;
        card.innerHTML = `
            <div class="card-inner">
                <div class="card-front">${emoji}</div>
                <div class="card-back">🦆</div>
            </div>
        `;
        // Add click event to flip the card
        card.addEventListener('click', () => flipCard(card, emoji));
        board.appendChild(card);
        cards.push({element: card, emoji, matched: false});
    });
}

// Handle card flip logic
function flipCard(card, emoji) {
    // Ignore if already matched, already flipped, two cards are flipped, or checking
    if (
        card.classList.contains('matched') ||
        !card.classList.contains('flipped') ||
        flippedCards.length === 2 ||
        isChecking
    ) return;

    // Start timer on first flip
    if (!gameStarted) {
        startTimer();
        gameStarted = true;
    }

    // Flip the card to show emoji
    card.classList.remove('flipped');
    flippedCards.push({card, emoji});

    // If two cards are flipped, check for match
    if (flippedCards.length === 2) {
        score++;
        scoreSpan.textContent = `Score: ${score}`;
        const [first, second] = flippedCards;
        if (first.emoji === second.emoji) {
            // If match, mark as matched
            setTimeout(() => {
                first.card.classList.add('matched');
                second.card.classList.add('matched');
                matchedCount += 2;
                flippedCards = [];
                // If all cards matched, end game
                if (matchedCount === cards.length) {
                    clearInterval(timerInterval);
                    setTimeout(() => alert(`You won! Score: ${score}, Time: ${timer}s`), 300);
                }
            }, 500);
        } else {
            // If not a match, flip back after delay
            isChecking = true;
            setTimeout(() => {
                first.card.classList.add('flipped');
                second.card.classList.add('flipped');
                flippedCards = [];
                isChecking = false;
            }, 900);
        }
    }
}

// Start the game timer
function startTimer() {
    timer = 0;
    timerSpan.textContent = `Time: 0s`;
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timer++;
        timerSpan.textContent = `Time: ${timer}s`;
    }, 1000);
}

// Restart the game (reset state and board)
function restartGame() {
    createBoard();
    clearInterval(timerInterval);
    timer = 0;
    timerSpan.textContent = `Time: 0s`;
    gameStarted = false;
    isChecking = false;
    if (flipBackTimeout) {
        clearTimeout(flipBackTimeout);
        flipBackTimeout = null;
    }
}

// Event listener for restart button
restartBtn.addEventListener('click', restartGame);

// Event listener for start button (difficulty selection)
startBtn.addEventListener('click', () => {
    currentDifficulty = difficultySelect.value; // Get selected difficulty
    difficultyDiv.style.display = 'none';       // Hide difficulty selector
    gameInfo.style.display = 'flex';            // Show game info bar
    createBoard();                              // Create board for selected difficulty
    startTimer();                               // Start timer
});

// Listen for difficulty change and restart game
difficultySelect.addEventListener('change', () => {
    currentDifficulty = difficultySelect.value;
    createBoard();
    clearInterval(timerInterval);
    timer = 0;
    timerSpan.textContent = `Time: 0s`;
    scoreSpan.textContent = `Score: 0`;
    gameStarted = false;
    isChecking = false;
    if (flipBackTimeout) {
        clearTimeout(flipBackTimeout);
        flipBackTimeout = null;
    }
});

// On page load, show only difficulty selector
window.onload = () => {
    difficultyDiv.style.display = 'flex';   // Show difficulty selector
    gameInfo.style.display = 'none';        // Hide game info bar
    board.innerHTML = '';                   // Clear board
};

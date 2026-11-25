// Game constants
const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SPEED = 150; // milliseconds
const BOSS_TRIGGER_SCORE = 100; // Score needed to trigger boss fight

// Game variables
let snake = [];
let food = {};
let boss = {};
let direction = 'right';
let nextDirection = 'right';
let score = 0;
let gameInterval;
let gameRunning = false;
let gameSpeed = INITIAL_SPEED;
let inBossFight = false;
let bossHealth = 100;
let bossAttackCooldown = 0;

// DOM elements
const gameBoard = document.getElementById('game-board');
const scoreElement = document.getElementById('score');
const startButton = document.getElementById('start-btn');
const pauseButton = document.getElementById('pause-btn');
const resetButton = document.getElementById('reset-btn');
const gameOverScreen = document.getElementById('game-over');
const finalScoreElement = document.getElementById('final-score');
const restartButton = document.getElementById('restart-btn');
const bossFightScreen = document.getElementById('boss-fight');
const bossHealthElement = document.getElementById('boss-health');

// Initialize the game board
function initializeBoard() {
    gameBoard.innerHTML = '';
    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.id = `cell-${i}`;
        gameBoard.appendChild(cell);
    }
}

// Initialize the snake
function initializeSnake() {
    snake = [
        {x: 10, y: 10},
        {x: 9, y: 10},
        {x: 8, y: 10}
    ];
}

// Generate food at random position
function generateFood() {
    let newFood;
    let onSnake;
    
    do {
        onSnake = false;
        newFood = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE)
        };
        
        // Check if food is on snake
        for (let segment of snake) {
            if (segment.x === newFood.x && segment.y === newFood.y) {
                onSnake = true;
                break;
            }
        }
    } while (onSnake);
    
    return newFood;
}

// Generate boss at random position
function generateBoss() {
    let newBoss;
    let onSnake;
    let onFood;
    
    do {
        onSnake = false;
        onFood = false;
        newBoss = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE)
        };
        
        // Check if boss is on snake
        for (let segment of snake) {
            if (segment.x === newBoss.x && segment.y === newBoss.y) {
                onSnake = true;
                break;
            }
        }
        
        // Check if boss is on food
        if (food.x === newBoss.x && food.y === newBoss.y) {
            onFood = true;
        }
    } while (onSnake || onFood);
    
    return newBoss;
}

// Move the snake
function moveSnake() {
    direction = nextDirection;
    
    // Create new head based on direction
    const head = {x: snake[0].x, y: snake[0].y};
    
    switch (direction) {
        case 'up':
            head.y -= 1;
            break;
        case 'down':
            head.y += 1;
            break;
        case 'left':
            head.x -= 1;
            break;
        case 'right':
            head.x += 1;
            break;
    }
    
    // Check collision with walls
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        gameOver();
        return;
    }
    
    // Check collision with self
    for (let i = 0; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
            gameOver();
            return;
        }
    }
    
    // Add new head to snake
    snake.unshift(head);
    
    // Check if food is eaten
    if (head.x === food.x && head.y === food.y) {
        // Increase score
        score += 10;
        scoreElement.textContent = score;
        
        // Generate new food
        food = generateFood();
        
        // Check if we should trigger boss fight
        if (!inBossFight && score >= BOSS_TRIGGER_SCORE) {
            triggerBossFight();
        }
        
        // Increase speed slightly (but cap at a minimum speed)
        if (gameSpeed > 50) {
            gameSpeed -= 2;
            clearInterval(gameInterval);
            gameInterval = setInterval(gameLoop, gameSpeed);
        }
    } else {
        // Remove tail if no food eaten
        snake.pop();
    }
    
    // Handle boss fight logic
    if (inBossFight) {
        moveBoss();
        
        // Check if boss is hit by snake head
        if (head.x === boss.x && head.y === boss.y) {
            // Boss takes damage
            bossHealth -= 10;
            bossHealthElement.textContent = bossHealth;
            
            if (bossHealth <= 0) {
                // Boss defeated!
                winGame();
                return;
            }
            
            // Push the snake back a bit to prevent immediate hit
            snake.shift();
        }
    }
    
    draw();
}

// Start the game
function startGame() {
    if (gameRunning) return;
    
    gameRunning = true;
    gameInterval = setInterval(gameLoop, gameSpeed);
    startButton.textContent = "Resume";
}

// Pause the game
function pauseGame() {
    if (!gameRunning) return;
    
    gameRunning = false;
    clearInterval(gameInterval);
    startButton.textContent = "Resume";
}

// Reset the game
function resetGame() {
    pauseGame();
    score = 0;
    scoreElement.textContent = score;
    gameSpeed = INITIAL_SPEED;
    direction = 'right';
    nextDirection = 'right';
    
    initializeSnake();
    food = generateFood();
    draw();
    
    gameOverScreen.style.display = "none";
    startButton.textContent = "Start Game";
}

// Game over
function gameOver() {
    pauseGame();
    finalScoreElement.textContent = score;
    gameOverScreen.style.display = "block";
}

// Boss fight functions
function triggerBossFight() {
    inBossFight = true;
    bossHealth = 100;
    bossHealthElement.textContent = bossHealth;
    
    // Generate boss position
    boss = generateBoss();
    
    // Show boss fight screen
    bossFightScreen.style.display = 'block';
    
    // Hide game over screen if it's visible
    gameOverScreen.style.display = 'none';
}

function moveBoss() {
    if (bossAttackCooldown > 0) {
        bossAttackCooldown--;
        return;
    }
    
    // Simple AI: move towards snake head
    const head = snake[0];
    const dx = head.x - boss.x;
    const dy = head.y - boss.y;
    
    // Move in the direction of the snake head (simplified)
    if (Math.abs(dx) > Math.abs(dy)) {
        // Move horizontally
        if (dx > 0) {
            boss.x += 1;
        } else {
            boss.x -= 1;
        }
    } else {
        // Move vertically
        if (dy > 0) {
            boss.y += 1;
        } else {
            boss.y -= 1;
        }
    }
    
    // Keep boss within bounds
    boss.x = Math.max(0, Math.min(GRID_SIZE - 1, boss.x));
    boss.y = Math.max(0, Math.min(GRID_SIZE - 1, boss.y));
    
    // Set cooldown for next move
    bossAttackCooldown = 2;
}

function winGame() {
    pauseGame();
    finalScoreElement.textContent = score;
    gameOverScreen.querySelector('h2').textContent = 'You Win!';
    gameOverScreen.querySelector('p').innerHTML = `Congratulations! You defeated the boss with a score of ${score}!`;
    gameOverScreen.style.display = 'block';
}

// Draw the game state
function draw() {
    // Clear the board
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.className = 'cell';
    });
    
    // Draw snake
    snake.forEach((segment, index) => {
        const cellIndex = segment.y * GRID_SIZE + segment.x;
        if (cellIndex >= 0 && cellIndex < cells.length) {
            if (index === 0) {
                cells[cellIndex].classList.add('snake-head');
            } else {
                cells[cellIndex].classList.add('snake');
            }
        }
    });
    
    // Draw food
    const foodIndex = food.y * GRID_SIZE + food.x;
    if (foodIndex >= 0 && foodIndex < cells.length) {
        cells[foodIndex].classList.add('food');
    }
    
    // Draw boss if in boss fight
    if (inBossFight) {
        const bossIndex = boss.y * GRID_SIZE + boss.x;
        if (bossIndex >= 0 && bossIndex < cells.length) {
            cells[bossIndex].classList.add('boss-head');
        }
    }
}

// Main game loop
function gameLoop() {
    moveSnake();
}

// Handle keyboard input
function handleKeyPress(e) {
    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            if (direction !== 'down') nextDirection = 'up';
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            if (direction !== 'up') nextDirection = 'down';
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            if (direction !== 'right') nextDirection = 'left';
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            if (direction !== 'left') nextDirection = 'right';
            break;
        case ' ':
            if (gameRunning) {
                pauseGame();
            } else {
                startGame();
            }
            break;
    }
}

// Event listeners
startButton.addEventListener('click', startGame);
pauseButton.addEventListener('click', pauseGame);
resetButton.addEventListener('click', resetGame);
restartButton.addEventListener('click', resetGame);
document.addEventListener('keydown', handleKeyPress);

// Initialize the game
initializeBoard();
initializeSnake();
food = generateFood();
draw();
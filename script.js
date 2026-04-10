function createPlayer(name, symbol) {
    const isBot = false;

    let gamesWonCount = 0;
    
    const getGamesWon = () => gamesWonCount;

    const newGameWon = () => gamesWonCount++;

    return { name, symbol, isBot, getGamesWon, newGameWon };
}

function createBot(botName, botSymbol) {
    const isBot = true;

    const { name, symbol, getGamesWon, newGameWon } = createPlayer(botName, botSymbol);

    const playRound = () => {
        let isRoundSuccessful = 2;
        while (isRoundSuccessful === 2) {
            const gridRow = Math.floor(Math.random() * 3);
            const gridCol = Math.floor(Math.random() * 3);
            isRoundSuccessful = gameManager.playRound(gridRow, gridCol);
        }
        return isRoundSuccessful;
    };

    return { name, symbol, isBot, getGamesWon, newGameWon, playRound };
}

const gameboard = function() {
    const DEFAULT_BOARD = [["-", "-", "-"],
                           ["-", "-", "-"],
                           ["-", "-", "-"]];

    let board = structuredClone(DEFAULT_BOARD);
    
    const getBoard = () => structuredClone(board);

    // Return true if successful, false if not
    const updateGrid = (symbol, gridRow, gridCol) => {
        const inBounds = gridRow < 3 && gridRow >= 0 && gridCol < 3 && gridCol >= 0;

        if (inBounds && board[gridRow][gridCol] === "-") {
            board[gridRow][gridCol] = symbol;
            return true;
        } else return false;
    }

    const resetBoard = () => board = structuredClone(DEFAULT_BOARD);

    return { getBoard, updateGrid, resetBoard };
}();

const gameManager = function() {
    const playerX = createPlayer("Player 1", "X");
    const playerO = createBot("Player 2", "O");

    let currentPlayer = playerX;

    const getCurrentPlayer = () => currentPlayer;

    const changeCurrentPlayer = () => currentPlayer = ((currentPlayer === playerX) ? playerO : playerX);

    const printNewRound = () => {
        console.log(gameboard.getBoard());
        console.log(`${getCurrentPlayer().name}'s turn. Symbol: ${getCurrentPlayer().symbol}`);
    };

    const checkIsBot = () => {
        if (getCurrentPlayer().isBot) return getCurrentPlayer().playRound();
    };

    //return 0 for no game won, current player for game won, 1 for tie, 2 for unsuccessful
    const playRound = (row, col) => {      
        const roundSuccessful = gameboard.updateGrid(getCurrentPlayer().symbol, row, col);

        if ((checkGameWon() || checkGameTie()) && roundSuccessful) {
            if (checkGameWon()) { 
                getCurrentPlayer().newGameWon();
                return getCurrentPlayer();
            }

            return 1;
        }

        if (roundSuccessful) {
            changeCurrentPlayer();
        } else {
            return 2
        };
        return 0;
    };

    const checkGameWon = () => {
        const currBoard = gameboard.getBoard();

        // Check for 3 of the same across
        for (let i = 0; i < 3; i++) {
            if (currBoard[i][0] === "-") continue; // Make sure row isn't in it's default state as the entire board is set to "-"
            if (currBoard[i][0] === currBoard[i][1] && currBoard[i][0] === currBoard[i][2]) return true;
        }

        // Check for 3 of the same down
        for (let i = 0; i < 3; i++) {
            if (currBoard[0][i] === "-") continue;
            if (currBoard[0][i] === currBoard[1][i] && currBoard[0][i] === currBoard[2][i]) return true;
        }

        // Check for 3 of the same diagonal
        if (currBoard[1][1] !== "-") {
            if (currBoard[0][0] === currBoard[1][1] && currBoard[1][1] === currBoard[2][2]) return true;
            if (currBoard[0][2] === currBoard[1][1] && currBoard[1][1] === currBoard[2][0]) return true;
        }

        return false;
    };

    const checkGameTie = () => !gameboard.getBoard().flat().includes("-");

    const resetGame = () => {
        gameboard.resetBoard();
        changeCurrentPlayer();
    };

    return { getCurrentPlayer, playRound, printNewRound, resetGame, checkIsBot, playerX, playerO };
}();

const displayManager = function() {
    const boardDiv = document.getElementById("gameboard");
    const playerXCard = document.getElementById("player-x");
    const playerOCard = document.getElementById("player-o");
    const playerXScoreCount = document.getElementById("score-num-x");
    const playerOScoreCount = document.getElementById("score-num-o");
    const playerXNameInput = document.getElementById("player-x-name");
    const playerONameInput = document.getElementById("player-o-name");
    const playerXIcon = document.getElementById("player-x-icon")
    const playerOIcon = document.getElementById("player-o-icon")
    const colorInputX = document.getElementById("color-input-x");
    const colorInputO = document.getElementById("color-input-o");
    const gameOverModal = document.getElementById("game-over-modal");
    const mainContent = document.getElementById("content");
    const winnerText = document.getElementById("winner-text");
    const winnerSymbol = document.getElementById("winner-symbol");
    const playAgainBtn = document.getElementById("play-again-btn");

    const updateScreen = () => {
        for (const grid of boardDiv.children) {
            const gridRow = grid.getAttribute("data-row");
            const gridCol = grid.getAttribute("data-col");
            const board = gameboard.getBoard();
            const gridSymbol = board[gridRow][gridCol]

            if (gridSymbol !== "-") {
                grid.textContent = gridSymbol;
                grid.classList.add(`player-${gridSymbol.toLowerCase()}-symbol`);
            }

            updatePlayerCards();
        }
    };

    const updatePlayerCards = () => {
        const currentPlayer = gameManager.getCurrentPlayer();
        if (currentPlayer.symbol === "X") {
            playerXCard.classList.add("current-player");
            playerOCard.classList.remove("current-player");
        } else {
            playerXCard.classList.remove("current-player");
            playerOCard.classList.add("current-player");
        }

        playerXScoreCount.textContent = gameManager.playerX.getGamesWon();
        playerOScoreCount.textContent = gameManager.playerO.getGamesWon();
    };

    const resetBoardDisplay = () => {
        for (const grid of boardDiv.children) {
            grid.textContent = ""
            grid.classList.remove("player-x-symbol")
            grid.classList.remove("player-o-symbol")
        }
    }

    boardDiv.addEventListener("click", (e) => {
        if (!e.target.hasAttribute("data-row")) return
        const gridRow = e.target.getAttribute("data-row");
        const gridCol = e.target.getAttribute("data-col");

        let winner = gameManager.playRound(gridRow, gridCol);
        checkWinner(winner);
        winner = gameManager.checkIsBot();
        checkWinner(winner);
    });

    const checkWinner = (winnerVal) => {
        updateScreen()
        if (winnerVal !== 0) {
            handleGameEnd(winnerVal);
        }
    };

    const handleGameEnd = (winner) => { 
        if (winner === 1) {
            winnerText.textContent = "Tie!";
        } else {
            winnerText.textContent = `${winner.name} wins!`;
            winnerSymbol.textContent = `${winner.symbol}`;
            winnerSymbol.className = `player-${winner.symbol.toLowerCase()}-symbol`;
        }

        gameOverModal.classList.add("visible");
        mainContent.style.filter = "blur(9px)";
    }

    playAgainBtn.addEventListener("click", () => {
        resetBoardDisplay();
        gameManager.resetGame();
        updatePlayerCards();
        gameOverModal.classList.remove("visible");
        mainContent.style.filter = "blur(0)";
    });

    // Player changed name
    playerXNameInput.addEventListener("change", (e) => {
        gameManager.playerX.name = e.target.value;
    });
    playerONameInput.addEventListener("change", (e) => {
        gameManager.playerO.name = e.target.value;
    });

    // Player clicked to changed color
    playerXIcon.addEventListener("click", () => colorInputX.click());
    colorInputX.addEventListener("change", (e) => document.documentElement.style.setProperty("--player-x-color", e.target.value))
    playerOIcon.addEventListener("click", () => colorInputO.click());
    colorInputO.addEventListener("change", (e) => document.documentElement.style.setProperty("--player-o-color", e.target.value))

    return { updateScreen };
}();
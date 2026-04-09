function createPlayer(name, symbol) {
    let gamesWonCount = 0;
    
    const getGamesWon = () => gamesWonCount;

    const newGameWon = () => gamesWonCount++;

    return { name, symbol, getGamesWon, newGameWon };
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
    const playerO = createPlayer("Player 2", "O");

    let currentPlayer = playerX;

    const getCurrentPlayer = () => currentPlayer;

    const changeCurrentPlayer = () => currentPlayer = ((currentPlayer === playerX) ? playerO : playerX);

    const printNewRound = () => {
        console.log(gameboard.getBoard());
        console.log(`${getCurrentPlayer().name}'s turn. Symbol: ${getCurrentPlayer().symbol}`);
    };

    //return 0 for no game won, current player for game won, 1 for tie
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
        }
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

    return { getCurrentPlayer, playRound, printNewRound, resetGame, playerX, playerO };
}();

const displayManager = function() {
    const boardDiv = document.getElementById("gameboard");
    const playerXCard = document.getElementById("player-x");
    const playerOCard = document.getElementById("player-o");
    const playerXScoreCount = document.getElementById("score-num-x");
    const playerOScoreCount = document.getElementById("score-num-o");
    const playerXNameInput = document.getElementById("player-x-name");
    const playerONameInput = document.getElementById("player-o-name");
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

        const winner = gameManager.playRound(gridRow, gridCol);
        updateScreen()
        if (winner !== 0) {
            handleGameEnd(winner)
        }
    });

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
    })

    // Player changed name
    playerXNameInput.addEventListener("change", (e) => {
        gameManager.playerX.name = e.target.value;
    })

    playerONameInput.addEventListener("change", (e) => {
        gameManager.playerO.name = e.target.value;
    })
}();
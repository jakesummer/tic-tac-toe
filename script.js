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
    let playerX = createPlayer("Player 1", "X");
    let playerO = createBot("Player 2", "O");

    let currentPlayer = playerX;

    const getCurrentPlayer = () => currentPlayer;

    const changeCurrentPlayer = () => currentPlayer = ((currentPlayer === playerX) ? playerO : playerX);

    const changePlayerType = (player) => {
        if (player === "x") {
            if (playerX.isBot) {
                playerX = createPlayer(playerX.name, "X");
                displayManager.playerXCard.classList.remove("bot");
            } else {
                playerX = createBot(playerX.name, "X");
                displayManager.playerXCard.classList.add("bot");
            }
        } else {
            if (playerO.isBot) {
                playerO = createPlayer(playerO.name, "O");
                displayManager.playerOCard.classList.remove("bot");
            } else {
                playerO = createBot(playerO.name, "O");
                displayManager.playerOCard.classList.add("bot");
            }
        }
    };

    const printNewRound = () => {
        console.log(gameboard.getBoard());
        console.log(`${getCurrentPlayer().name}'s turn. Symbol: ${getCurrentPlayer().symbol}`);
    };

    const checkIsBot = () => {
        if (getCurrentPlayer().isBot) {
            const timeout = (Math.random() * (1500 - 500 + 1) + 500); // Random time between 0.5 sec and 1.5 sec
            setTimeout(() => {
                const turnResult = getCurrentPlayer().playRound();
                displayManager.handleTurnEnd(turnResult);
            }, timeout);
        }
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

    return { getCurrentPlayer, playRound, printNewRound, resetGame, checkIsBot, changePlayerType, playerX, playerO };
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
    const playerTypeBtn = document.querySelectorAll(".player-type-btn");

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
    };

    boardDiv.addEventListener("click", (e) => {
        if (!gameManager.getCurrentPlayer().isBot) {
            if (!e.target.hasAttribute("data-row")) return
            const gridRow = e.target.getAttribute("data-row");
            const gridCol = e.target.getAttribute("data-col");

            let turnResult = gameManager.playRound(gridRow, gridCol);
            handleTurnEnd(turnResult);
        }
    });

    const handleTurnEnd = (turnResult) => {
        updateScreen()
        if (turnResult !== 0) {
            handleGameEnd(turnResult);
        }
        gameManager.checkIsBot();
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
    };

    const restartGame = () => {
        resetBoardDisplay();
        gameManager.resetGame();
        gameManager.checkIsBot();
        updateScreen();
    };

    playAgainBtn.addEventListener("click", () => {
        restartGame();
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
    colorInputX.addEventListener("change", (e) => document.documentElement.style.setProperty("--player-x-color", e.target.value));
    playerOIcon.addEventListener("click", () => colorInputO.click());
    colorInputO.addEventListener("change", (e) => document.documentElement.style.setProperty("--player-o-color", e.target.value));

    // Player changed type (human/robot)
    playerTypeBtn.forEach((btn) => {
        btn.addEventListener("click", (e) => {
            if (e.currentTarget.dataset.type === "human") {
                e.currentTarget.dataset.type = "bot";
                e.currentTarget.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>robot</title><path d="M12,2A2,2 0 0,1 14,4C14,4.74 13.6,5.39 13,5.73V7H14A7,7 0 0,1 21,14H22A1,1 0 0,1 23,15V18A1,1 0 0,1 22,19H21V20A2,2 0 0,1 19,22H5A2,2 0 0,1 3,20V19H2A1,1 0 0,1 1,18V15A1,1 0 0,1 2,14H3A7,7 0 0,1 10,7H11V5.73C10.4,5.39 10,4.74 10,4A2,2 0 0,1 12,2M7.5,13A2.5,2.5 0 0,0 5,15.5A2.5,2.5 0 0,0 7.5,18A2.5,2.5 0 0,0 10,15.5A2.5,2.5 0 0,0 7.5,13M16.5,13A2.5,2.5 0 0,0 14,15.5A2.5,2.5 0 0,0 16.5,18A2.5,2.5 0 0,0 19,15.5A2.5,2.5 0 0,0 16.5,13Z" /></svg>
                <p>Robot</p>`;
            } else {
                e.currentTarget.dataset.type = "human";
                e.currentTarget.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>account</title><path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" /></svg>
                <p>Human</p>`;
            }

            gameManager.changePlayerType(e.currentTarget.dataset.player);
            restartGame();
        })
    });

    return { handleTurnEnd, playerOCard, playerXCard };
}();
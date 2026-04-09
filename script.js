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

    //return 0 for no game won, 1 for game won, 2 for tie
    const playRound = (row, col) => {        
        const roundSuccessful = gameboard.updateGrid(getCurrentPlayer().symbol, row, col);

        if ((checkGameWon() || checkGameTie()) && roundSuccessful) {
            console.log(gameboard.getBoard());
            if (checkGameWon()) { 
                console.log(`${getCurrentPlayer().name} (${getCurrentPlayer().symbol}) won!`);
                getCurrentPlayer().newGameWon();
                return 1;
            } else { 
                console.log("Tie!");
            }

            changeCurrentPlayer();
            return 2;
        }

        if (roundSuccessful) {
            changeCurrentPlayer();
        } else {
            console.log("Row and column must be between 0 and 2 and grid must be '-'!");
        }
        printNewRound();
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
    };

    return { getCurrentPlayer, playRound, printNewRound, resetGame };
}();

/* Display Manager (IIFE)
Handles clicks
    - Calls gameManager to update board
    - Displays Symbol on screen
Display current player's turn
Display score for both players
Displays winner/tie */
const displayManager = function() {
    const boardDiv = document.getElementById("gameboard");
    const playerXCard = document.getElementById("player-x");
    const playerOCard = document.getElementById("player-O");

    const updateScreen = () => {
        for (const grid of boardDiv.children) {
            const gridRow = grid.getAttribute("data-row");
            const gridCol = grid.getAttribute("data-col");
            const board = gameboard.getBoard();
            const gridSymbol = board[gridRow][gridCol]

            if (gridSymbol !== "-") {
                grid.textContent = gridSymbol;
                grid.classList.add(`${gridSymbol.toLowerCase()}-grid`);
            }
        }
    }

    const resetBoardDisplay = () => {
        for (const grid of boardDiv.children) {
            grid.textContent = ""
            grid.classList.remove("x-grid")
            grid.classList.remove("o-grid")
        }
    }

    boardDiv.addEventListener("click", (e) => {
        const gridRow = e.target.getAttribute("data-row");
        const gridCol = e.target.getAttribute("data-col");

        const gameStatus = gameManager.playRound(gridRow, gridCol);
        updateScreen()
        if (gameStatus === 1) {
            resetBoardDisplay();
            gameManager.resetGame();
        }
    });

    return { resetBoardDisplay }
}();
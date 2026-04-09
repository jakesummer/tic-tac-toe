function createPlayer(name, symbol) {
    let gamesWonCount = 0;
    
    const getGamesWon = () => gamesWonCount;

    const newGameWon = () => gamesWonCount++;

    const resetWinCount = () => gamesWonCount = 0;

    return { name, symbol, getGamesWon, newGameWon, resetWinCount };
}

const gameboard = function() {
    const DEFAULT_BOARD = [["-", "-", "-"],
                           ["-", "-", "-"],
                           ["-", "-", "-"]];

    let board = structuredClone(DEFAULT_BOARD);
    
    const getBoard = () => board;

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

    const playRound = (row, col) => {        
        const roundSuccessful = gameboard.updateGrid(getCurrentPlayer().symbol, row, col);

        if (checkGameWon() && roundSuccessful) {
            console.log(gameboard.getBoard());
            console.log(`${getCurrentPlayer().name} (${getCurrentPlayer().symbol}) won!`);
            resetGame();
            return;
        }

        if (roundSuccessful) {
            changeCurrentPlayer();
        } else {
            console.log("Row and column must be between 0 and 2 and grid must be '-'!");
        }
        printNewRound();
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

    const resetGame = () => {
        gameboard.resetBoard();
        playerX.resetWinCount();
        playerO.resetWinCount();
    };

    return { getCurrentPlayer, playRound, printNewRound };
}();
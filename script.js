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

    const board = DEFAULT_BOARD;
    
    const getBoard = () => board;

    // Return true if successful, false if not
    const updateGrid = (symbol, gridRow, gridCol) => {
        if (board[gridRow][gridCol] === "-" && (gridRow < 3 && gridRow > -1) && (gridCol < 3 && gridRow > -1)) {
            board[gridRow][gridCol] = symbol;
            return true;
        } else return false;
    }

    const resetBoard = () => board = DEFAULT_BOARD;

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

        if (roundSuccessful) {
            changeCurrentPlayer();
        } else {
            console.log("Row and column must be between 0 and 2 and grid must be '-'!");
        }
        printNewRound();
    };

    const checkGameWon = () => { };

    const resetGame = () => {
        board.resetBoard();
        playerX.resetWinCount();
        playerO.resetWinCount();
    };

    return { getCurrentPlayer, playRound, printNewRound };
}();
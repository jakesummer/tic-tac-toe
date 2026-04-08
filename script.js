function createPlayer(name) {
    let gamesWonCount = 0;
    
    const getGamesWon = () => gamesWonCount;

    const newGameWon = () => gamesWonCount++;

    return { name, getGamesWon, newGameWon };
}

const gameboard = function() {
    const DEFAULT_BOARD = [[null, null, null],
                           [null, null, null],
                           [null, null, null]];

    const board = DEFAULT_BOARD;
    
    const getBoard = () => board;

    // Return true if successful, false if not
    const updateGrid = (symbol, gridRow, gridCol) => {
        if (board[gridRow][gridCol] === null) {
            board[gridRow][gridCol] = symbol;
            return true;
        } else return false;
    }

    const resetBoard = () => board = DEFAULT_BOARD;

    return { getBoard, updateGrid, resetBoard };
}();

/* Game manager object (IIFE) 
Play round function
Get current player function
Change current player function 
Check winner function
Reset game function */
function createPlayer(name) {
    let gamesWonCount = 0;
    
    const getGamesWon = () => gamesWonCount;

    const newGameWon = () => gamesWonCount++;

    return { name, getGamesWon, newGameWon };
}


/* Gameboard Object (IIFE) 
Store gameboard in 2d array (each grid starts out as null and gets updated to X or O depending on players icon)
gameboard getter
Update grid function 
Print gameboard function 
Reset gameboard function*/

/* Game manager object (IIFE) 
Play round function
Get current player function
Change current player function 
Check winner function
Reset game function */
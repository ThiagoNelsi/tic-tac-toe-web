const restartButton = document.getElementById('btn-restart');
const difficultyInput = document.getElementById('difficulty'); 
const playerSign = 'x';
const robotSign = 'o';
const robotTurnEvent = new CustomEvent('robotTurn');
const tableFull = new CustomEvent('tableFull');
const game = new CustomEvent('game');

let robotTurn = Boolean(Math.floor(Math.random() * 2));
let winner = null;
let difficultyIndex = difficultyInput.value;

const difficultyValues = [1, 10, 1000, 10000];

class Table {

    constructor(baseTable = Array(9).fill('')) {
        this.squares = document.querySelectorAll('td');
        this.tableElement = document.querySelector('table');
        this.table = baseTable;

        this.squares.forEach(square => {
            square.addEventListener('click', () => {
                this.check(square.dataset.index, playerSign)
            });
        })

    }

    check(squareIndex, sign) {

        if (robotTurn && sign !== robotSign) return ;
        if (this.squares[squareIndex].classList.contains('checked')) return;

        for (let square of this.squares) {
            if (square.dataset.index == squareIndex) {
                square.innerHTML = sign;
                square.classList.add('checked');
                this.table[squareIndex] = sign;

                if (Table.verifyWinner(this.table, sign)) {
                    winner = sign;
                    window.dispatchEvent(new CustomEvent('endOfGame', { detail: { winner } }));
                    return;
                }

                if (Table.getAvailableSquares(this.table).length === 0) {
                    window.dispatchEvent(tableFull);
                    return;
                }

                if (!robotTurn) window.dispatchEvent(robotTurnEvent);

            }
        }

    }

    static getAvailableSquares(table) {
        const free = table.map((square, index) => {
            if (square === '') {
                return index;
            }
        });

        return free.filter(position => typeof position === 'number');
    }

    block() {
        document.querySelector('.block').style.display = 'flex';
    }

    unblock() {
        document.querySelector('.block').style.display = 'none';
    }

    reset() {
        this.squares.forEach(square => {
            square.innerHTML = '';
            square.classList.remove('checked');
        });
        this.table.fill('');
    }

    static verifyWinner(table, sign) {
        // lines
        if (table[0] == sign && table[1] == sign && table[2] == sign) {
            return true;
        } else if (table[3] == sign && table[4] == sign && table[5] == sign) {
            return true;
        } else if (table[6] == sign && table[7] == sign && table[8] == sign) {
            return true;
        }
        // columns
        else if (table[0] == sign && table[3] == sign && table[6] == sign) {
            return true;
        } else if (table[1] == sign && table[4] == sign && table[7] == sign) {
            return true;
        } else if (table[2] == sign && table[5] == sign && table[8] == sign) {
            return true;
        }
        // Crosses
        else if (table[0] == sign && table[4] == sign && table[8] == sign) {
            return true;
        } else if (table[2] == sign && table[4] == sign && table[6] == sign) {
            return true;
        } else {
            return  false
        }
    }

}

class Robot {
    play(table) {
        robotTurn = true;
        table.block();
        const bestPosition = Robot.getBestSquareToCheck(table.table, robotSign);
        table.check(bestPosition, robotSign);
        setTimeout(() => {
            robotTurn = false;
            table.unblock();
        }, 0);
    }

    static getBestSquareToCheck(table) {
        const availableSquares = Table.getAvailableSquares(table);
        
        const availableSquaresRates = Array(availableSquares.length).fill(0);

        for (let i in availableSquares) {

            const copyTable = [...table];
            
            copyTable[availableSquares[i]] = robotTurn ? robotSign : playerSign;

            for (let j = 0; j < difficultyValues[difficultyIndex]; j++) {

                let testTable = [...copyTable];

                let robotTurnTest = !!robotTurn;

                let weight = availableSquares.length;

                while (true) {

                    weight -= 1;
                    robotTurnTest = !robotTurnTest;

                    const availableSquaresTest = Table.getAvailableSquares(testTable);

                    if (availableSquaresTest.length === 0) break;

                    const randomSquare = availableSquaresTest[Math.floor(Math.random() * availableSquaresTest.length)]

                    if (robotTurnTest) {
                        testTable[randomSquare] = robotSign;
                        if (Table.verifyWinner(testTable, robotSign)) {
                            availableSquaresRates[i] += weight;
                            break;
                        }
                    } else {
                        testTable[randomSquare] = playerSign;
                        if (Table.verifyWinner(testTable, playerSign)) {
                            availableSquaresRates[i] -= weight;
                            break;
                        }
                    }

                }

            }
        }

        const best = availableSquaresRates.reduce((previous, current) => {
            return Math.max(previous, current);
        });

        const bestAvailableSquareIndex = availableSquaresRates.indexOf(best);

        return availableSquares[bestAvailableSquareIndex];
    }
}

const table = new Table();
const robot = new Robot();

restartButton.addEventListener('click', () => {
   window.dispatchEvent(game); 
});

difficultyInput.addEventListener('change', () => difficultyIndex = difficultyInput.value);

window.addEventListener('robotTurn', () => {
    robot.play(table, robotSign)
});

window.addEventListener('endOfGame', ({ detail }) => {
    alert((detail.winner === 'o' ? 'Robot' : 'You') + ' won!!!');
    table.block()
    setTimeout(() => {
        table.reset();
        table.unblock();
    }, 1000);
});

window.addEventListener('tableFull', () => {
    setTimeout(() => {
        table.reset();
    }, 1000);
});

window.addEventListener('game', () => {
    robotTurn = Boolean(Math.floor(Math.random() * 2));
    table.reset();
    if (robotTurn) window.dispatchEvent(robotTurnEvent);
})

window.dispatchEvent(game);

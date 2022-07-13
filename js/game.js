'use strict';

const MINE = getElementHTML(`<img src ="img/mine.png">`, 'mine');
const flagSound = new Audio('sounds/flag-sound.wav');
const flagUnmarkSound = new Audio('sounds/flag-sound2.wav');
const elBestTime = document.querySelector('.best-time');
const elLives = document.querySelector('.lives');
const elCheckBox = document.querySelector('.lives input');
const elHint = document.querySelector('.hint');

var elTimer;
var gBoard;
var gTimerInterval;
var gBestTime;

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    lifeCount: 2,
    livesOn: true,
    hintOn: false,
    hintCount: 3,
};

var gLevel = chooseLevel(4, 2);

function init() {
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        lifeCount: gLevel.mineCount < 3 ? gLevel.mineCount : 3,
        hintOn: false,
        hintCount: 3,
    };
    elHint.classList.remove('hint-on');
    elHint.innerText = 'Use hint(3)';
    elTimer = document.querySelector('.timer');
    elTimer.innerText = '00:00 ';
    displayBestTime();
    toggleLives(elCheckBox);
    if (gTimerInterval) pauseWatch();
    gTimerInterval = null;
    document.querySelector('.btn-new').innerText = '🙂';
    gBoard = createBoard(gLevel.size, gLevel.mineCount);
    renderBoard(gBoard, '.board-container');
    renderLives();
}

function createBoard(size) {
    const board = [];

    for (var i = 0; i < size; i++) {
        board[i] = [];
        for (var j = 0; j < size; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMarked: false,
                isMine: false,
            };
        }
    }

    return board;
}

function renderBoard(board, selector) {
    var strHTML = ` 
  <table><tbody> <tr> <th  colspan="${board[0].length}">
    <button onclick="init()" 
     class="btn-new">🙂</button></th></tr>`
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < board[0].length; j++) {
            var className = `cell cell-${i}-${j}`;
            strHTML += `
            <td onclick ="cellClicked(this, ${i}, ${j})" 
            oncontextmenu="cellMarked(event,this, ${i}, ${j})"
             class="${className}">  </td>`;
        }
        strHTML += '</tr>';
    }
    strHTML += '</tbody></table>';
    var elContainer = document.querySelector(selector);
    elContainer.innerHTML = strHTML;
}

function placeMines(board, mineCount, clickedCell) {
    for (var i = 0; i < mineCount; i++) {
        var emptyCell = getEmptyCell(board, clickedCell);
        board[emptyCell.i][emptyCell.j].isMine = true;
    }
}

function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j];
            if (cell.isMine) continue;
            setMineAroundCount(i, j, board);
        }
    }
}

function setMineAroundCount(cellI, cellJ, board) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue;
            if (j < 0 || j >= board[i].length) continue;

            if (board[i][j].isMine) board[cellI][cellJ].minesAroundCount++;
        }
    }
}

function cellMarked(ev, elCell, i, j) {
    ev.preventDefault();
    var cell = gBoard[i][j];
    if (!gGame.shownCount) gGame.isOn = true;
    if (cell.isShown || !gGame.isOn || gGame.hintOn) return;
    if (!gTimerInterval) startWatch(elTimer);

    cell.isMarked = !cell.isMarked;
    if (cell.isMarked) {
        elCell.innerText = '🚩';
        gGame.markedCount++;
        flagSound.load();
        flagSound.play();
    } else {
        elCell.innerText = '';
        gGame.markedCount--;
        flagUnmarkSound.load();
        flagUnmarkSound.play();
    }
}

function cellClicked(elCell, i, j) {
    var cell = gBoard[i][j];
    if (!gGame.shownCount) {
        gGame.isOn = true;
        placeMines(gBoard, gLevel.mineCount, cell);
        setMinesNegsCount(gBoard);
    }
    if (cell.isMarked || !gGame.isOn || cell.isShown) return;
    if (!gTimerInterval) startWatch(elTimer);
    if (gGame.hintOn) {
        renderHint(gBoard, i, j);
        gGame.hintOn = false;
        return;
    }

    showCell(cell, elCell, { i, j });
    if (cell.isMine) {
        gGame.lifeCount--;
        var elHeart = document.querySelector(`.life${gGame.lifeCount}`);
        popHeart(elHeart);
        if (!gGame.lifeCount) {
            showMines(gBoard);
            gameOver();
        }
    } else {
        if (!cell.minesAroundCount) expandShown(gBoard, i, j);
        if (checkGameWon()) gameOver();
    }
}

function renderCell(location, value) {
    // Select the elCell and set the value
    var elCell = document.querySelector(`.cell-${location.i}-${location.j}`);
    elCell.innerHTML = value;
}

function getElementHTML(element, className = '') {
    return `<span class = "${className}">${element}</span>`;
}

function checkGameWon() {
    return gGame.shownCount === gBoard.length ** 2 - gLevel.mineCount;
}

function gameOver(isVictory = checkGameWon()) {
    var elBtnNew = document.querySelector('.btn-new');
    if (!isVictory) {
        elBtnNew.innerText = '🤯';
    } else {
        elBtnNew.innerText = '😎';
        var newTime = gGame.secsPassed;
        if (gBestTime > newTime || gBestTime === '--') {
            localStorage.setItem(`gBestTime${gLevel.size}`, newTime);
            displayBestTime();
        }
    }
    gGame.isOn = false;

    pauseWatch();
}

function chooseLevel(size, mineCount) {
    if (gTimerInterval || gLevel?.size === size) return;

    gLevel = {
        size,
        mineCount,
    };
    if (gGame.livesOn) gGame.lifeCount = mineCount < 3 ? mineCount : 3;
    else gGame.lifeCount = 1;

    displayBestTime();
    gBoard = createBoard(gLevel.size, gLevel.mineCount);
    renderBoard(gBoard, '.board-container');
    if (gGame.lifeCount > 1) renderLives();

    return gLevel;
}

function showCell(cell, elCell, location) {
    elCell.innerText = cell.minesAroundCount || '';
    switch (cell.minesAroundCount) {
        case 1:
            elCell.style.color = 'green';
            break;
        case 2:
            elCell.style.color = 'blue';
            break;
        case 3:
            elCell.style.color = 'red';
            break;
        case 4:
            elCell.style.color = 'purple';
            break;
        case 5:
            elCell.style.color = 'yellow';
            break;
    }
    if (cell.isMine) renderCell(location, MINE);
    elCell.classList.add('shown');
    if (gGame.hintOn) {
        setTimeout(hideCell, 1000, elCell);
        return;
    }
    if (!cell.isMine && !cell.isShown) gGame.shownCount++;
    cell.isShown = true;
}

function expandShown(board, cellI, cellJ, prevNoMinesCellLocation = '') {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue;
            if (j < 0 || j >= board[i].length) continue;
            var cell = board[i][j];
            if (cell.isShown) continue;
            // If the current cell has 0 mines around it and it's location
            // is different from the previous 0 mines around cell, expand his neighbours as well
            if (
                !cell.minesAroundCount &&
                (prevNoMinesCellLocation?.cellI !== i ||
                    prevNoMinesCellLocation?.cellJ !== j)
            ) {
                prevNoMinesCellLocation = { cellI, cellJ };
                expandShown(board, i, j, prevNoMinesCellLocation);
            }

            var elCell = document.querySelector(`.cell-${i}-${j}`);
            showCell(cell, elCell);
        }
    }
    return;
}

function startWatch() {
    var startTime = Date.now();
    gTimerInterval = setInterval(function printTime() {
        var elapsedTime = Date.now() - startTime;
        elTimer.innerText = timeToString(elapsedTime);
        gGame.secsPassed++;
    }, 1000);
}

function pauseWatch() {
    clearInterval(gTimerInterval);
}

function displayBestTime() {
    gBestTime = localStorage.getItem(`gBestTime${gLevel.size}`) ?? '--';
    elBestTime.innerText = `Best Time:\n${gBestTime} second/s`;
}

function showMines(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            var cell = board[i][j];
            if (!cell.isMine || cell.isShown) continue;
            var elCell = document.querySelector(`.cell-${i}-${j}`);
            showCell(cell, elCell, { i, j });
        }
    }
}

function popHeart(elHeart) {
    elHeart.classList.add('popped');
}

function renderLives() {
    if (!elCheckBox.checked) return;
    var livesHtmlStr = ` <input onclick="toggleLives(this, event)" checked  type="checkbox" /> Lives: `;
    for (var i = 0; i < gGame.lifeCount; i++) {
        livesHtmlStr += `
        <div class="heart-container life${i}">
        <span class="heart"></span>
  </div>`;
    }
    elLives.innerHTML = livesHtmlStr;
}

function toggleLives(elCheckBox, ev) {
    if (gGame.isOn) {
        ev.preventDefault();
        ev.stopPropagation();
        return false;
    }
    if (elCheckBox.checked) {
        gGame.lifeCount = gLevel.mineCount < 3 ? gLevel.mineCount : 3;
        renderLives();
        gGame.livesOn = true;
    } else {
        for (var i = 0; i < gGame.lifeCount; i++) {
            var elHeart = document.querySelector(`.life${i}`);
            popHeart(elHeart);
        }
        gGame.livesOn = false;
        gGame.lifeCount = 1;
    }
}

function renderHint(board, cellI, cellJ) {
    elHint.classList.remove('hint-on');
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= board[i].length) continue;
            var cell = board[i][j];
            if (cell.isShown) continue;

            var elCell = document.querySelector(`.cell-${i}-${j}`);
            showCell(cell, elCell, { i, j });
            setTimeout(hideCell, 500, elCell, { i, j });
        }
    }
}

function turnOnHint(elHint) {
    if (gGame.hintOn || !gGame.isOn || !gGame.hintCount) return;
    gGame.hintCount--;
    elHint.innerText = `Use hint(${gGame.hintCount})`;
    gGame.hintOn = true;
    elHint.classList.add('hint-on');
}

function hideCell(elCell, location) {
    renderCell(location, '');
    elCell.classList.remove('shown');
}

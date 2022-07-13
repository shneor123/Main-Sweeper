'use strict';

function countNeighbors(cellI, cellJ, mat) {
    var neighborsCount = 0;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue;
            if (j < 0 || j >= mat[i].length) continue;

            if (mat[i][j] === LIFE || mat[i][j] === SUPER_LIFE) neighborsCount++;
        }
    }
    return neighborsCount;
}

function renderBoard(mat, selector) {
    var strHTML = '<table border="0"><tbody>';
    for (var i = 0; i < mat.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < mat[0].length; j++) {
            var cell = mat[i][j].value;
            var className = `cell cell- ${i} - ${j}`;
            strHTML += `<td class="${className}"> ${cell} </td>'`;
        }
        strHTML += '</tr>';
    }
    strHTML += '</tbody></table>';
    var elContainer = document.querySelector(selector);
    elContainer.innerHTML = strHTML;
}

function renderCell(location, value) {
    var elCell = document.querySelector(`.cell-${location.i}-${location.j}`);
    elCell.innerHTML = value;
}

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getNums(length) {
    const nums = [];
    for (var i = 1; i <= length; i++) {
        nums.push(i);
    }
    return nums;
}

function createBoard(size) {
    const board = [];
    for (var i = 0; i < size; i++) {
        board[i] = [];
        for (var j = 0; j < size; j++) {
            board[i][j] = {
                value: '',
                isHit: false,
            };
        }
    }
    return board;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return (Math.random() * (max - min) + min) | 0;
}

function shuffleNums(arr) {
    for (var i = 0; i <= arr.length; i++) {
        var randomIdx = getRandomInt(0, arr.length);
        var shuffledNum = arr.splice(randomIdx, 1)[0];
        randomIdx = getRandomInt(0, arr.length);
        arr.splice(randomIdx, 0, shuffledNum);
    }
    return arr;
}

// Take an input time and display it as a string template xx:xx:xx
function timeToString(time) {
    var diffInHrs = time / 3600000;
    var hh = Math.floor(diffInHrs);

    var diffInMin = (diffInHrs - hh) * 60;
    var mm = Math.floor(diffInMin);

    var diffInSec = (diffInMin - mm) * 60;
    var ss = Math.floor(diffInSec);

    var formattedHH = hh.toString().padStart(2, '0');
    var formattedMM = mm.toString().padStart(2, '0');
    var formattedSS = ss.toString().padStart(2, '0');

    return `${formattedMM}:${formattedSS}`;
}

function startWatch() {
    var startTime = Date.now();
    gTimerInterval = setInterval(function printTime() {
        elapsedTime = Date.now() - startTime;
        stopWatchEl.innerText = timeToString(elapsedTime);
    }, 1000);
}

function pauseWatch() {
    clearInterval(timerInterval);
}

function getEmptyCells(board) {
    const emptyCells = [];
    for (var i = 1; i < board.length - 1; i++) {
        for (var j = 1; j < board[0].length - 1; j++) {
            if (board[i][j].gameElement) continue;
            emptyCells.push({ i, j });
        }
    }
    return emptyCells;
}

function getEmptyCell(board, clickedCell) {
    const emptyCells = [];
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            if (board[i][j].isMine || board[i][j] === clickedCell) continue;
            emptyCells.push({ i, j });
        }
    }
    return emptyCells[getRandomInt(0, emptyCells.length)];
}

function addElement(board, element) {
    var emptyCells = getEmptyCells();
    var randomCoord = emptyCells[getRandomInt(0, emptyCells.length)];
    board[randomCoord.i][randomCoord.j].gameElement = element;
    renderCell(randomCoord, element);
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function getRandomCoord(board) {
    const idxsI = getNums(board.length - 1);
    const idxsJ = getNums(board[0].length - 1);

    const coord = {
        i: idxsI[getRandomInt(0, idxsI.length)],
        j: idxsJ[getRandomInt(0, idxsJ.length)],
    };

    return coord;
}

function getElementHTML(element, className) {
    return (
        `<span class = "${className}">${element}</span>`
    )
}

var i = 1;
var playerOne, playerTwo, placementOne, placementTwo;
var historyOne = new Map();
var historyTwo = new Map();
var winner;
var mapOne, mapTwo;
var gameOn = true;
var currPlayer = "";
var mapObject = {"one": {}, "two": {}};
var countOne = {"a": 0, "b": 0, "s": 0};
var countTwo = {"a": 0, "b": 0, "s": 0};
var endCount = {"a": 5, "b": 4, "s": 3};

window.onload = function() {
    gameScores();
}

function gameScores() {
    //log scores
    var oldScores = JSON.parse(localStorage.getItem("scores"));
    if (oldScores === null) {
        document.getElementById("scores").style.display = "none";
        return;
    }
    document.getElementById("scores").style.display = "block";
    for (let player in oldScores) {
        let newRow = document.createElement("tr");
        let newPlayer = document.createElement("td");
        newPlayer.textContent = player;
        let newScore = document.createElement("td");
        newScore.textContent = oldScores[player];
        newRow.appendChild(newPlayer);
        newRow.appendChild(newScore);
        document.getElementById("scoresTable").appendChild(newRow);
    }
}

function submit() {
    var name = document.getElementById("playerName").value;
    var placement = document.getElementById("playerPlacement").value;
    // document.getElementById("playerName").value = "";
    // document.getElementById("playerPlacement").value = "";

    $("#playerName").val("");
    $("#playerPlacement").val("");

    //null check
    if (!name || !placement ) {
        alert("input can't be empty");
        return;
    }
    //if (!checkPlacement(placement, i)) alert("Bad placement format");
    let msg = checkPlacement(placement);
    if (msg !== "ok") {
        alert(msg);
        return;
    }

    if (i == 1) {
        playerOne = name;
        placementOne = placement;
        i++;
        $("#playerNumberTitle").text("Player Two");
    } else {
        $("#playerName").prop("disabled", true);
        $("#playerPlacement").prop("disabled", true);
        if (playerOne === name) {
            alert("Two players can't have same name");
            return;
        }
        playerTwo = name;
        placementTwo = placement;
        document.getElementById("playerNames").appendChild(document.createTextNode("Player One: " + playerOne));
        $("#playerNames").append("<br>");
        document.getElementById("playerNames").appendChild(document.createTextNode("Player Two: " + playerTwo));
        $("#playerInfoSubmitButton").prop("disabled", true);
        $("#startGameButton").attr("style", "display: inline");
    }
}//function submitName

//check placement is valid
function checkPlacement(placement) {
    placement = placement.replace(/ /g, "").toLowerCase();  //strip space
    let arr = placement.replace(/\;$/, "").split(";");  //strip last ";"
    let map = new Map();
    if (arr.length != 3)    return "Ship number not right";    //missing ship
    let re = /^[abs](:[a-j]([1-9]|10|0[1-9])\-[a-j]([1-9]|10|0[1-9])|\([a-j]([1-9]|10|0[1-9])\-[a-j]([1-9]|10|0[1-9])\))$/gi;
    for (let n = 0; n < 3; n++) {
        let ship = arr[n];
        if (!ship.match(re))    return "Invalid input";
        map.set(ship.substring(0,1), ship.substring(2,7)); //ex: 0: {"a" => "a1-a5"}
    }
    if (!map.has("a") || !map.has("b") || !map.has("s") ) return "Ship type not right";

    for(let [key, value] of map.entries()) {
        let char = Math.abs(value.charCodeAt(0) - value.charCodeAt(3));
        let num = Math.abs(parseInt(value.charAt(4)) - parseInt(value.charAt(1)));
        if (key === "a") {
            if(!((char === 4 && num === 0) || (char === 0 && num === 4)))
                return "ship A size wrong";
        } else if (key === "b") {
            if(!((char === 3 && num === 0) || (char === 0 && num === 3)))
                return "ship B size wrong";
        } else if (key === "s") {
            if(!((char === 2 && num === 0) || (char === 0 && num === 2)))
                return "ship S size wrong";
        } else {
            return "Wrong ship"; //should never get to this line
        }
    }
    if (i == 1) {mapOne = map;}
    else mapTwo = map;
    return "ok";
}

function startGame() {
    $("#startGameButton").attr("style", "display: none");
    $("#welcome").attr("style", "display: none");
    $("#boardOne").attr("style", "display: block");
    $("#boardTwo").attr("style", "display: block");
    $("#switchPlayerButton").attr("style", "display: block");
    $("#newGameButton").attr("style", "display: none");

    //populate ships to mapObject
    for (let [key, value] of mapOne.entries()) {
        mapObject.one[key] = getCoordinates(value, "one");
    }
    for (let [key, value] of mapTwo.entries()) {
        mapObject.two[key] = getCoordinates(value, "two");
    }
    switchPlayer();
}

function startNewGame() {
    $("#playerName").prop("disabled", false);
    $("#playerPlacement").prop("disabled", false);
    $("#welcome").attr("style", "display: block");
    $("#boardOne").attr("style", "display: none");
    $("#boardTwo").attr("style", "display: none");
    $("#switchPlayerButton").attr("style", "display: none");
    $("#startGameButton").attr("style", "display: none");
    $("#newGameButton").attr("style", "display: none");

    document.getElementById("report").textContent = "";
    document.getElementById("gameStatus").textContent = "";
    document.getElementById("playerNames").textContent = "";
    document.getElementById("playerNumberTitle").innerText = "Player One";
    document.getElementById("playerInfoSubmitButton").disabled = false;
    $('#scoresTable').children().not(':first').remove();
    gameScores();
    currPlayer = "";

    for (let [key, value] of historyOne.entries())
        document.getElementById(key).className = "";
    for (let [key, value] of historyTwo.entries())
        document.getElementById(key).className = "";

    playerOne = "";
    playerTwo = "";
    historyOne = new Map();
    historyTwo = new Map();
    placementOne = "";
    placementTwo = "";
    gameOn = true;
    countOne = {"a": 0, "b": 0, "s": 0};
    countTwo = {"a": 0, "b": 0, "s": 0};
    mapObject = {"one": {}, "two": {}};
    i = 1;
}

function switchPlayer() {
    document.getElementById("switchPlayerButton").disabled = true;
    if (currPlayer === "" || currPlayer === playerTwo) {
        currPlayer = playerOne;
    } else {
        currPlayer = playerTwo;
    }
    if (gameOn) {
        alert("Click to begin " + currPlayer + "\'s turn");
        toggleBoard();
    }
}

function hit(hitCoordinate) {
    let isHit = false;
    let boardNum = hitCoordinate.substring(0,3);
    let alertMsg = "You hit. ";
    for(var ship in mapObject[boardNum]) {
        arr = mapObject[boardNum][ship];
        arr.forEach(function(c) {
            if(hitCoordinate === c) {
                isHit = true;
                if (boardNum === "one") {  //if hitting on board one => player two playing
                    countTwo[ship] ++;  //count of player two's hit
                    alertMsg += sunkShip("two", ship);
                } else {
                    countOne[ship] ++;  //count of player one's hit
                    alertMsg += sunkShip("one", ship);
                }
            }
        });
    }
    if (isHit) {
        document.getElementById(hitCoordinate).className = "hitShip unclickable";
        if (boardNum === "one") historyTwo.set(hitCoordinate, true);    //player two playing
        else historyOne.set(hitCoordinate, true);
        //if dou hit do shit
        //record hit
        //check if an enitre shit is down,
            //if so, check if game is over
    } else {
        alertMsg = "You missed";
        document.getElementById(hitCoordinate).className = "missedShip unclickable";
        if (boardNum === "one") { //player two playing on board one
            historyTwo.set(hitCoordinate, false);    //player one playing
        } else {
            historyOne.set(hitCoordinate, false);
        }
    }
    alert(alertMsg);
    document.getElementById("boardOne").classList.add("unclickable");
    document.getElementById("boardTwo").classList.add("unclickable");
    if(gameOn) {
        document.getElementById("switchPlayerButton").disabled = false;
    } else {
        gameOver();
    }
}

function gameOver() {
    //start new game
    document.getElementById("newGameButton").style.display = "block";
    var loserScore = 0;
    var loser;
    var winnerName, loserName;
    if (winner === "one") {
        loser = historyTwo;
        winnerName = playerOne;
        // loserName = playerTwo;
    }
    else {
        loser = historyOne;
        winnerName = playerTwo;
        // loserName = playerOne;
    }
    for (let [key, value] of loser.entries()) {
        if (value) {
            loserScore += 2;
        }
    }
    winnerScore = 24 - loserScore;
    alert("Winner " + winnerName + " got " + winnerScore + " points.");
    // alert("Loser " + loserName + " got " + loserScore + " points.");
    document.getElementById("report").innerText = "Winner " + winnerName + " scored " + winnerScore + " points.";

    //initialize localStorage
    if (localStorage.getItem("scores") === null) {
        localStorage.setItem("scores", JSON.stringify({[winnerName]: winnerScore}));
        return;
    }

    let oldScores = JSON.parse(localStorage.getItem('scores'));

    //if currentUser already has a score
    if (oldScores.hasOwnProperty(winnerName)) {
        if (oldScores[winnerName] < winnerScore) {
            oldScores[winnerName] = winnerScore;
            window.localStorage.setItem("scores", JSON.stringify(oldScores));
        }
    } else {
        //if already has 10 players in localStorage
        if (Object.keys(oldScores).length >= 10) {
            var min = 24;
            var minKey = "";
            for (var player in oldScores) {
                if (oldScores[player] < min) {
                    min = oldScores[player];
                    minKey = player;
                }
            }
            if (minKey !== "" && winnerScore > min) {
                delete oldScores[minKey];
                oldScores[winnerName] = winnerScore;
                window.localStorage.setItem("scores", JSON.stringify(oldScores));
            }
        } else {
            oldScores[winnerName] = winnerScore;
            window.localStorage.setItem("scores", JSON.stringify(oldScores));
        }
    }
}


//check if a ship has been sunked
function sunkShip(playerNum, ship) {
    let result = "";
    let count;
    if (playerNum === "one") {
        count = countOne[ship];
        if (JSON.stringify(countOne) === JSON.stringify(endCount)) {
            gameOn = false;
            winner = "one";
        }
    } else {
        count = countTwo[ship];
        if (JSON.stringify(countTwo) === JSON.stringify(endCount)) {
            gameOn = false;
            winner = "two";
        }
    }
    if (ship === "a") {
        if (count === 5)
            result += " Aircraft down.";
    } else if (ship === "b") {
        if (count === 4)
            result += " Battleship down.";
    } else {
        if (count === 3)
            result += " Submarine down.";
    }
    if (!gameOn)
        result += "\nCongratulations!! You've won the game!";
    return result;
}

//toggle board location and update table content
function toggleBoard() {
    //default: playerone's placement is placed on board one, player two's on board two
    if (currPlayer === playerOne) {
        removeShipText("two");  //rm placement text on board two (player two's placement)
        addShipText("one");     //add placement on bottomboard = curr player's placement
        addHistory("historyOne");   //add current player's game history
        document.getElementById("gameStatus").textContent = "Player one: " + playerOne + "\'s turn...";
        document.getElementById("boardOne").className = "bottomBoard unclickable";
        document.getElementById("boardTwo").className = "topBoard";
    } else {
        removeShipText("one");
        addShipText("two");
        addHistory("historyTwo");
        document.getElementById("gameStatus").textContent = "Player two: " + playerTwo + "\'s turn...";
        document.getElementById("boardOne").className = "topBoard";
        document.getElementById("boardTwo").className = "bottomBoard unclickable";
    }
}

function addHistory(history) {
    if (history === 'historyOne') {
        for (let [key, value] of historyOne.entries()) {
            if (value) {
                document.getElementById(key).className = "hitShip unclickable";
            } else {
                document.getElementById(key).className = "missedShip unclickable";
            }
        }
    } else {
        for (let [key, value] of historyTwo.entries()) {
            if (value) {
                document.getElementById(key).className = "hitShip unclickable";
            } else {
                document.getElementById(key).className = "missedShip unclickable";
            }
        }
    }
}

//add ship placement text to boardNum aka player#
function addShipText(boardNum) {
    for(var ship in mapObject[boardNum]) {
        arr = mapObject[boardNum][ship];
        arr.forEach(function(c) {
            document.getElementById(c).className += " ship";
            document.getElementById(c).textContent = ship.toUpperCase();
        });
    }
}

function removeShipText(boardNum) {
    for(var ship in mapObject[boardNum]) {
        arr = mapObject[boardNum][ship];
        arr.forEach(function(c) {
            document.getElementById(c).className = "";
            document.getElementById(c).textContent = "";
        });
    }
}

function getCoordinates(range, boardNum) {
    let sm, bg;
    let result = [];
    //if char is same => horizontal
    if (range.charAt(0) === range.charAt(3)) {//number range
        if (parseInt(range.charAt(1)) > parseInt(range.charAt(4))) {
            sm = parseInt(range.charAt(4));
            bg = parseInt(range.charAt(1));
        } else {
            bg = parseInt(range.charAt(4));
            sm = parseInt(range.charAt(1));
        }
        for (let i = sm; i <= bg; i++) {
            result.push(boardNum + range.charAt(0).toUpperCase() + i.toString());
        }
    }
    else {
        //letter range a-e
        if (range.charCodeAt(0) > range.charCodeAt(3)) {
            sm = range.charCodeAt(3);
            bg = range.charCodeAt(0);
        } else {
            bg = range.charCodeAt(3);
            sm = range.charCodeAt(0);
        }
        for (let i = 0; i <= bg-sm; i++) {
            result.push(boardNum + String.fromCharCode(sm + i).toUpperCase() + range.charAt(1).toString());
        }
    }
    return result;
}

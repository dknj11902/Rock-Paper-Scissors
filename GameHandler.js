var debounce = true;
var lsDebug = true;
var preventDoubleCallHack = false;
var replayButton;

function getRandomIntInclusive(min, max) {
  // returns random number between 'min' and 'max' inclusive
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function LightenDarkenColor(col, amt) {
  var usePound = true;

  if (col[0] == "#") {
    col = col.slice(1);
    usePound = true;
  }

  var num = parseInt(col,16);

  var r = (num >> 16) + amt;

  if (r > 255) r = 255;
  else if  (r < 0) r = 0;

  var b = ((num >> 8) & 0x00FF) + amt;

  if (b > 255) b = 255;
  else if  (b < 0) b = 0;

  var g = (num & 0x0000FF) + amt;

  if (g > 255) g = 255;
  else if (g < 0) g = 0;

  return (usePound?"#":"") + (g | (b << 8) | (r << 16)).toString(16);
}

function rgb2hex(rgb) {
  if (/^#[0-9A-F]{6}$/i.test(rgb)) return rgb;

  rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  function hex(x) {
    return ("0" + parseInt(x).toString(16)).slice(-2);
  }
  return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}

function prepare() { 
  // make rock/paper/scissors buttons vanish/fade in
  $(".buttons").css("display","none");
  $(".buttons").fadeIn(1000);
  
  // link button click events to its corresponding functions
  $("button").hover(
    function() {
      var currentColor = $(this).css("background-color");
      var lighterColor = LightenDarkenColor(rgb2hex(currentColor), 10);
      $(this).css("background-color",lighterColor);
    },
    function () {
      var currentColor = $(this).css("background-color");
      var darkerColor = LightenDarkenColor(rgb2hex(currentColor), -10);
      $(this).css("background-color",darkerColor);
    }
  );
  $("button").click(function() {
    var whichButton = $(this).attr("id");
    if (whichButton === "replayButton") {
      replay()
    } else if (whichButton === "resetScoresButton") {
      resetScores();
    } else {
      bridge(whichButton);
    }
  });
}

function bridge(choice) {
  if (debounce) {
    debounce = false;
    $(".buttons, #instructions").slideUp(function(){
      handleUserChoice(choice);
    });
  }
}

function determineComputerChoice() {
  var generatedNumber = getRandomIntInclusive(1,3);
  var choice;
  switch (generatedNumber) {
    case 1:
      choice = "rock";
      break;
    case 2:
      choice = "paper";
      break;
    case 3:
      choice = "scissors";
      break;
  }
  return choice;
}

function getScore(key) {
  if (localStorage.getItem(key)) {
    return localStorage.getItem(key);
  } else {
    localStorage.setItem(key, "0");
    return localStorage.getItem(key);
  }
}

var incrementScore = function (resultKey) {
  if (lsDebug && preventDoubleCallHack) {
    lsDebug = false;
    var incrementedScore = Number(localStorage.getItem(resultKey)) + 1;
    localStorage.setItem(resultKey, incrementedScore);
  } else {
    preventDoubleCallHack = true;
  }
}

function resetScores() {
  var doubt = confirm("Are you sure you want to reset your wins, ties, and losses?");
  if (doubt) {
    localStorage.clear();
    alert("The scores have been reset. The page will now be refreshed.");
    replay();
  } else {
    alert("Your scores have not been reset.");
  }
}

function handleUserChoice(userChoice) {
  var compChoice = determineComputerChoice();
  $("#userInputDisplay").html("You threw: <span>" + userChoice + "</span>");
  $("#computerInput").html("The computer plays: <span>" + compChoice + "</span>");
  compare(userChoice, compChoice);

  //incrementScore(winnerOfGame);
  $("#wins").text(getScore("wins"));
  $("#ties").text(getScore("ties"));
  $("#losses").text(getScore("losses"));
  
  $("#userInputDisplay").slideDown(function() {
    $("#computerInput").delay(100).slideDown(function() {
      $("#whoWon").delay(200).slideDown(function () {
        $("#resultTable, #lastButtons").delay(300).slideDown();
      });
    });
  });
  // end of game
}

var compare = function(user, computer) {
  if (user === computer) {
    incrementScore("ties");
    $("#whoWon").html("The result is a <span>tie</span>!");
  } else if (user === "rock") {
    if (computer === "scissors") {
      incrementScore("wins");
      $("#whoWon").html("<span>You</span> win!");
    } else {
      incrementScore("losses");
      $("#whoWon").html("<span>The computer</span> wins!");
    }
  } else if (user === "paper") {
    if (computer === "rock") {
      incrementScore("wins");
      $("#whoWon").html("<span>You</span> win!");
    } else {
      incrementScore("losses");
      $("#whoWon").html("<span>The computer</span> wins!");
    }
  } else if (user === "scissors") {
    if (computer === "paper") {
      incrementScore("wins");
      $("#whoWon").html("<span>You</span> win!");
    } else {
      incrementScore("losses");
      $("#whoWon").html("<span>The computer</span> wins!");
    }
  } else {
    alert("error");
    replay()
  }
};

function replay() {
  $("body").fadeOut('fast', function() {
    window.location.reload(); 
  });
}

$(document).ready(prepare);
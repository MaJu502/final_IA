const io = require('socket.io-client')
const URL = "http://192.168.1.134:4000"
const socket = io(URL)

const tournamentID = 142857

socket.on('connect', () => {
    console.log("Connected to server")

    socket.emit('signin', {
        user_name: "MrJ",
        tournament_id: 142857,
        user_role: 'player'
    })
})

socket.on('ok_signin', () => {
    console.log("Login")
})

socket.on('ready', function(data){
    var gameID = data.game_id;
    var playerTurnID = data.player_turn_id;
    var board = data.board;
  });

  socket.on('finish', function(data){
    var gameID = data.game_id;
    var playerTurnID = data.player_turn_id;
    var winnerTurnID = data.winner_turn_id;
    var board = data.board;
  });

  socket.on('ready', function(data){
    var gameID = data.game_id;
    var playerTurnID = data.player_turn_id;
    var board = data.board;
    
    // TODO: Your logic / user input here
    var numeroAleatorio = Math.floor(Math.random() * 7);
    console.log(board)
    console.log(numeroAleatorio)
    
    socket.emit('play', {
      tournament_id: tournamentID,
      player_turn_id: playerTurnID,
      game_id: gameID,
      movement: numeroAleatorio
    });
  });

  socket.on('finish', function(data){
    var gameID = data.game_id;
    var playerTurnID = data.player_turn_id;
    var winnerTurnID = data.winner_turn_id;
    var board = data.board;
    
    // TODO: Your cleaning board logic here
    console.log(board)
    console.log(winnerTurnID)
    
    socket.emit('player_ready', {
      tournament_id: tournamentID,
      player_turn_id: playerTurnID,
      game_id: gameID
    });
  });
const io = require('socket.io-client')
const URL = "http://192.168.1.134:4000"
const socket = io(URL)
const tournamentID = 142857

const ROWSIZE = 7; // Tamaño de la fila del tablero
const ROWCOUNT = 6; // Número de filas del tablero

// Función principal para encontrar el mejor movimiento
function EL_GENIO_DETRAS_DE_TODO(board, playerTurnID) {
  const maxDepth = 5; // Profundidad máxima para el algoritmo minimax
  const alpha = -Infinity; // Valor alfa para la poda alfa-beta
  const beta = Infinity; // Valor beta para la poda alfa-beta

  // Duplicar el tablero
  const boardCopy = [...board.map((row) => [...row])];

  // Obtener el índice de la columna del mejor movimiento mediante el algoritmo minimax
  const columnIndex = minimax(boardCopy, maxDepth, alpha, beta, true, playerTurnID).columnIndex;

  return columnIndex; // Devolver la columna del mejor movimiento
}

// Verificar si un movimiento en una columna es válido
function is_valid_move(board, col) {
  //return board[0][col] == 0
  return board[ROWCOUNT-1][col] == 0;
}

// Obtener los movimientos válidos en el tablero
function get_valid_moves(board) {
  const valid_moves = [];

  for (let col = 0; col < ROWSIZE; col++) {
    if (is_valid_move(board, col)) {
      valid_moves.push(col);
    }
  }

  return valid_moves; // Devolver los movimientos válidos
}

// Calcular la puntuación del tablero para un jugador dado
function evaluar_estado_actual(board, playerTurnID) {
  const OPO = playerTurnID === 1 ? 2 : 1; // ID del oponente
  let puntuacion = 0;

  // Calcular puntuación horizontal
  for (let row = 0; row < ROWCOUNT; row++) {
    for (let col = 0; col < 4; col++) {
      const permutacion = [board[row][col], board[row][col + 1], board[row][col + 2], board[row][col + 3]];
      puntuacion += evaluador(permutacion, playerTurnID, OPO);
    }
  }

  // Calcular puntuación vertical
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < ROWSIZE; col++) {
      const permutacion = [board[row][col], board[row + 1][col], board[row + 2][col], board[row + 3][col]];
      puntuacion += evaluador(permutacion, playerTurnID, OPO);
    }
  }

  // Calcular puntuación en diagonales ascendentes
  for (let row = 3; row < ROWCOUNT; row++) {
    for (let col = 0; col < 4; col++) {
      const permutacion = [board[row][col], board[row - 1][col + 1], board[row - 2][col + 2], board[row - 3][col + 3]];
      puntuacion += evaluador(permutacion, playerTurnID, OPO);
    }
  }

  // Calcular puntuación en diagonales descendentes
  for (let row = 3; row < ROWCOUNT; row++) {
    for (let col = 3; col < ROWSIZE; col++) {
      const permutacion = [board[row][col], board[row - 1][col - 1], board[row - 2][col - 2], board[row - 3][col - 3]];
      puntuacion += evaluador(permutacion, playerTurnID, OPO);
    }
  }

  return puntuacion; // Devolver la puntuación del tablero
}

// Calcular la puntuación para una combinación de fichas dada
function evaluador(permutacion, playerTurnID, OPO) {
  let puntuacion = 0;

  // Puntuación del jugador actual
  if (permutacion.filter((cell) => cell === playerTurnID).length === 4) {
    puntuacion += 100;
  } else if (permutacion.filter((cell) => cell === playerTurnID).length === 3 && permutacion.filter((cell) => cell === 0).length === 1) {
    puntuacion += 5;
  } else if (permutacion.filter((cell) => cell === playerTurnID).length === 2 && permutacion.filter((cell) => cell === 0).length === 2) {
    puntuacion += 2;
  }

  // Puntuación del oponente
  if (permutacion.filter((cell) => cell === OPO).length === 3 && permutacion.filter((cell) => cell === 0).length === 1) {
    puntuacion -= 4;
  }

  return puntuacion; // Devolver la puntuación de la combinación
}

// Generar un nuevo tablero después de realizar un movimiento en una columna dada
function generate_new_board_with_new_move(board, columnIndex, playerTurnID) {
  const nuevaSimulacion_tablero = [...board.map((row) => [...row])];

  for (let row = ROWCOUNT-1; row >= 0; row--) {
    if (nuevaSimulacion_tablero[row][columnIndex] === 0) {
      nuevaSimulacion_tablero[row][columnIndex] = playerTurnID;
      break;
    }
  }

  return nuevaSimulacion_tablero; // Devolver el nuevo tablero
}

// Implementar el algoritmo minimax con poda alfa-beta
function minimax(board, depth, alpha, beta, maximizingPlayer, playerTurnID) {
  const valid_moves = get_valid_moves(board);
  let BIGBRAIN_MOVE = null;

  if (depth === 0 || valid_moves.length === 0) {
    const puntuacion = evaluar_estado_actual(board, playerTurnID);
    return { puntuacion }; // Devolver la puntuación si se alcanza la profundidad máxima o no hay movimientos válidos
  }

  if (maximizingPlayer) {
    // MAX 
    let maxVALUE_puntuacion = -Infinity;

    for (let move of valid_moves) {
      const nuevaSimulacion_tablero = generate_new_board_with_new_move(board, move, playerTurnID);
      const result = minimax(nuevaSimulacion_tablero, depth - 1, alpha, beta, false, playerTurnID); // RECURSIÓN
      const puntuacion = result.puntuacion;

      if (puntuacion > maxVALUE_puntuacion) {
        maxVALUE_puntuacion = puntuacion;
        BIGBRAIN_MOVE = move;
      }

      alpha = Math.max(alpha, maxVALUE_puntuacion);

      if (alpha >= beta) {
        break;
      }
    }

    return { puntuacion: maxVALUE_puntuacion, columnIndex: BIGBRAIN_MOVE };

  } else {
    // MIN
    let minVALUE_puntuacion = Infinity;

    for (let move of valid_moves) {
      const nuevaSimulacion_tablero = generate_new_board_with_new_move(board, move, playerTurnID === 1 ? 2 : 1);
      const result = minimax(nuevaSimulacion_tablero, depth - 1, alpha, beta, true, playerTurnID); // RECURSIÓN
      const puntuacion = result.puntuacion;

      if (puntuacion < minVALUE_puntuacion) {
        minVALUE_puntuacion = puntuacion;
        BIGBRAIN_MOVE = move;
      }

      beta = Math.min(beta, minVALUE_puntuacion);

      if (alpha >= beta) {
        break;
      }
    }

    return { puntuacion: minVALUE_puntuacion, columnIndex: BIGBRAIN_MOVE };
  }
}


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

    // Mostrar informacion del juego
    console.log(' >> ¡Es el turno del jugador ${playerTurnID}!')
    console.log(" >> Estado actual del tablero:")
    console.log(board)

    
    // IA LOGIC
    var IA_generated_move = EL_GENIO_DETRAS_DE_TODO(board, playerTurnID);
    
    
    socket.emit('play', {
      tournament_id: tournamentID,
      player_turn_id: playerTurnID,
      game_id: gameID,
      movement: IA_generated_move
    });
  });

  socket.on('finish', function(data){
    var gameID = data.game_id;
    var playerTurnID = data.player_turn_id;
    var winnerTurnID = data.winner_turn_id;
    var board = data.board;
    
    // TODO: Your cleaning board logic here
    // Mostrar informacion del juego
    console.log(' >> ¡Es el turno del jugador ${playerTurnID}!')
    console.log(" >> Estado actual del tablero:")
    console.log(board)

    
    // IA LOGIC
    var IA_generated_move = EL_GENIO_DETRAS_DE_TODO(board, playerTurnID);
    
    socket.emit('player_ready', {
      tournament_id: tournamentID,
      player_turn_id: playerTurnID,
      game_id: gameID,
      movement: IA_generated_move
    });
  });
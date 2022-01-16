;(function (exports) {
  /*
   * Server to client: set as player W
   */
  exports.T_PLAYER_TYPE = 'PLAYER-TYPE'
  exports.O_PLAYER_W = {
    type: exports.T_PLAYER_TYPE,
    data: 'w',
  }

  /*
   * Server to client: set as player B
   */
  exports.O_PLAYER_B = {
    type: exports.T_PLAYER_TYPE,
    data: 'b',
  }

  /*
   * Server to client: game starts
   */
  exports.T_GAME_START = 'GAME_START'
  exports.O_GAME_START = {
    type: exports.T_GAME_START,
  }

  /*
   * Player B to server OR server to Player A: guessed character
   */
  exports.T_MOVE = 'MOVE'
  exports.O_MOVE = {
    type: exports.T_MOVE,
    data: null,
  }

  /*
   * Server to Player A & B: game over with result won/loss
   */
  exports.T_GAME_OVER = 'GAME-OVER'
  exports.O_GAME_OVER = {
    type: exports.T_GAME_OVER,
    data: null,
  }
})(typeof exports === 'undefined' ? (this.Messages = {}) : exports)
//if exports is undefined, we are on the client; else the server

let GameState = (ws) => {
  let socket = ws
  let time = { white: 600, black: 600 }
  let castling = { left: true, right: true }
  let enPassant = { row: -1, col: -1 }
  let colour = null
  let end = false

  return {
    setPhase: (p) => (phase = p),
    setTime: (t) => (time = t),
    getEnPassant: () => enPassant,
    setEnPassant: (square) => (enPassant = square),
    getCastling: () => castling,
    setCastling: (state) => (castling = state),
    getPhase: () => phase,
    getColour: () => colour,
    setColour: (c) => (colour = c),
    move: (m) => {
      console.log(m)
      let msg = Messages.O_MOVE
      msg.data = m
      ws.send(JSON.stringify(msg))
    },
    beEnd: () => (end = true),
    isEnd: () => end,
  }
}

// setup
;(() => {
  const socket = new WebSocket(Config.WEBSOCKET_URL)
  const gameState = GameState(socket)
  let board = Board(gameState)

  socket.onmessage = (ev) => {
    let msg = JSON.parse(ev.data)

    switch (msg.type) {
      case Messages.T_PLAYER_TYPE:
        gameState.setColour(msg.data === 'w' ? 'light' : 'dark')
        break

      case Messages.T_GAME_START:
        board.innit()
        break

      case Messages.T_MOVE:
        board.moveOpponent(msg.data)
        break

      case Messages.T_GAME_OVER:
        if (gameState.isEnd()) break
        board.die(msg.data === 'w' ? 'dark' : 'light')
        console.log(`player ${msg.data} won`)
        gameState.beEnd()
        break

      default:
        break
    }
  }
})()

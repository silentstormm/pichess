const { format } = require('express/lib/response')
const websocket = require('ws')

function gameConstructor(gameID) {
  let playerW = null
  let playerB = null
  let id = gameID
  let time = { white: 600, black: 600 }
  let castling = { white: { left: true, right: true }, white: { left: true, right: true } }
  let enPassant = { white: { row: -1, col: -1 }, black: { row: -1, col: -1 } }
  let gameState = '0 joint'
  let captured = { white: '', black: '' }
  let board = [
    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'],
  ]

  function pieceInWay(from, to) {
    let direction = { row: to.row > from.row ? 1 : -1, col: to.col > from.col ? 1 : -1 }
    for (let i = 1; i < Math.abs(from.row - to.row); i++) {
      if (/[kqrnbpKQRNBP]/.test(board[from.row + direction.row * i][from.col + direction.col * i])) return true
    }
    return false
  }
  function validateMove(player, from, to) {
    // prettier-ignore
    if (
        from.row < 0 || from.row > 7 || from.col < 0 || from.col > 7 ||
        to.row < 0 || to.row > 7 || to.col < 0 || to.col > 7
      ) return false

    let piece = board[from.row][from.col]
    let dest = board[to.row][to.col]
    if (player === 'b' && !/[kqrnbp]/.test(piece)) return false
    if (player === 'w' && !/[KQRNBP]/.test(piece)) return false

    if (player === 'b' && /[kqrnbp]/.test(dest)) return false
    if (player === 'w' && /[KQRNBP]/.test(dest)) return false

    switch (piece) {
      case 'k':
        if (from.row === 0 && from.col === 4 && ((to.row === 0 && to.col === 6) || (to.row === 0 && to.col === 1))) {
          if (to.row === 0 && to.col === 6 && (/[kqrnbpKQRNBP]/.test(board[0][5]) || !castling.black.right))
            return false
          if (
            to.row === 0 &&
            to.col === 1 &&
            (/[kqrnbpKQRNBP]/.test(board[0][2]) || /[kqrnbpKQRNBP]/.test(board[0][3]) || !castling.black.left)
          )
            return false
        }
        if (Math.abs(from.row - to.row) > 1 || Math.abs(from.col - to.col) > 1) return false
        break
      case 'K':
        if (from.row === 7 && from.col === 4 && ((to.row === 7 && to.col === 6) || (to.row === 7 && to.col === 1))) {
          if (to.row === 7 && to.col === 6 && (/[kqrnbpKQRNBP]/.test(board[7][5]) || !castling.white.right))
            return false
          if (
            to.row === 7 &&
            to.col === 1 &&
            (/[kqrnbpKQRNBP]/.test(board[7][2]) || /[kqrnbpKQRNBP]/.test(board[7][3]) || !castling.white.left)
          )
            return false
        }
        if (Math.abs(from.row - to.row) > 1 || Math.abs(from.col - to.col) > 1) return false
        break
      case 'q':
      case 'Q':
        if (Math.abs(from.row - to.row) !== Math.abs(from.col - to.col)) return false
        if (from.row !== to.row && from.col !== to.col) return false
        if (pieceInWay(from, to)) return false
        break
      case 'r':
      case 'R':
        if (from.row !== to.row && from.col !== to.col) return false
        if (pieceInWay(from, to)) return false
        break
      case 'n':
      case 'N':
        if (
          !(Math.abs(from.row - to.row) === 2 && Math.abs(from.col - to.col) === 1) &&
          !(Math.abs(from.row - to.row) === 1 && Math.abs(from.col - to.col) === 2)
        )
          return false
        break
      case 'b':
      case 'B':
        if (Math.abs(from.row - to.row) !== Math.abs(from.col - to.col)) return false
        if (pieceInWay(from, to)) return false
        break
      case 'p':
        if (to.row - from.row !== 1 || to.row - from.row !== 2 || Math.abs(to.col - from.col) > 1) return false
        if (to.row - format.row === 2 && from.row != 1) return false
        if (
          Math.abs(to.col - from.col) === 1 &&
          !(to.row === enPassant.black.row && to.col === enPassant.black.col) &&
          !/[KQRNBP]/.test(dest)
        )
          return false
        break
      case 'P':
        if (to.row - from.row !== -1 || to.row - from.row !== -2 || Math.abs(to.col - from.col) > 1) return false
        if (to.row - format.row === -2 && from.row != -1) return false
        if (
          Math.abs(to.col - from.col) === 1 &&
          !(to.row === enPassant.white.row && to.col === enPassant.white.col) &&
          !/[kqrnbp]/.test(dest)
        )
          return false
        break
      default:
        return false
    }
    return true
  }

  return {
    move: (player, from, to) => {
      if (validateMove(player, from, to)) {
        let piece = board[from.row][from.col]
        board[from.row][from.col] = ' '
        let dest = board[to.row][to.col]
        board[to.row][to.col] = piece
        if (/[kqrnbp]/.test(dest)) captured.white += dest
        if (/[KQRNBP]/.test(dest)) captured.black += dest
        if (piece === 'K') castling.white = { left: false, right: false }
        if (piece === 'k') castling.black = { left: false, right: false }
        if (from.row === 7 && from.col === 0) castling.white.left = false
        if (from.row === 7 && from.col === 7) castling.white.right = false
        if (from.row === 0 && from.col === 0) castling.black.left = false
        if (from.row === 0 && from.col === 7) castling.black.right = false
        if (piece === 'P' && to.row - from.row === -2)
          enPassant = { white: { row: -1, col: -1 }, black: { row: to.row - 1, col: to.col } }
        else if (piece === 'p' && to.row - from.row === 2)
          enPassant = { white: { row: to.row + 1, col: to.col }, black: { row: -1, col: -1 } }
        else enPassant = { white: { row: -1, col: -1 }, black: { row: -1, col: -1 } }
        if (dest === 'k') endGame('w')
        else if (dest === 'K') endGame('b')
        return true
      } else {
        if (player === 'w') endGame('b')
        else endGame('w')
        return false
      }
    },
    endGame: (winner) => {
      gameState = winner
    },
    addPlayer: (player) => {
      if (gameState !== '0 joint' && gameState !== '1 joint')
        return new Error(`Invalid call to addPlayer, current state is ${gameState}`)
      if (playerW === null) {
        playerW = player
        gameState = '1 joint'
        return 'w'
      } else {
        playerB = player
        gameState = '2 joint'
        return 'b'
      }
    },
    setTime: (player, t) => {
      if (player === 'w') time.white = t
      else if (player === 'b') time.black = t
    },
    hasTwoConnectedPlayers: () => {
      return gameState === '2 joint'
    },
    determinePlayer: (player) => {
      if (player === playerW) return 'w'
      else return 'b'
    },
    getGameID: () => {
      return id
    },
    getPlayerW: () => {
      return playerW
    },
    getPlayerB: () => {
      return playerB
    },
    getGameState: () => {
      return gameState
    },
    setGameState: (status) => {
      gameState = status
    },
  }
}

module.exports = gameConstructor

const express = require('express')
const http = require('http')
const websocket = require('ws')

const indexRouter = require('./routes/index')
const messages = require('./public/js/messages')

const gameStatus = require('./statTracker')
const Game = require('./game')

const port = process.argv[2]
const app = express()

app.set('view engine', 'ejs')
app.use(express.static(__dirname + '/public'))

app.get('/play', indexRouter)
app.get('/', indexRouter)

const server = http.createServer(app)
const wss = new websocket.Server({ server })

const websockets = {}

setInterval(function () {
  for (let i in websockets) {
    //if the websockets[i] has a final status, the game is complete/aborted
    if (/[wbd]/.test(websockets[i].gameState)) {
      delete websockets[i]
    }
  }
}, 50000)

let currentGame = Game(gameStatus.gamesInitialized++)
let connectionID = 0

wss.on('connection', function connection(ws) {
  const con = ws
  con.id = connectionID++
  const playerType = currentGame.addPlayer(con)
  websockets[con.id] = currentGame

  console.log(`Player ${con.id} placed in game ${currentGame.getGameID()} as ${playerType}`)

  /*
   * inform the client about its assigned player type
   */
  if (playerType === 'w') {
    con.send(JSON.stringify(messages.O_PLAYER_W))
  } else {
    con.send(JSON.stringify(messages.O_PLAYER_B))
    con.send(JSON.stringify(messages.O_GAME_START))
    currentGame.getPlayerW().send(JSON.stringify(messages.O_GAME_START))
  }

  /*
   * once we have two players, there is no way back;
   * a new game object is created;
   * if a player now leaves, the game is aborted (player is not preplaced)
   */
  if (currentGame.hasTwoConnectedPlayers()) {
    currentGame = Game(gameStatus.gamesInitialized++)
  }

  /*
   * message coming in from a player:
   *  1. determine the game object
   *  2. determine the opposing player OP
   *  3. send the message to OP
   */
  con.on('message', (message) => {
    const oMsg = JSON.parse(message.toString())

    const gameObj = websockets[con.id]
    const player = gameObj.determinePlayer(con)

    console.log(`message ${JSON.stringify(oMsg.type)} received`)

    if (oMsg.type === messages.T_MOVE) {
      console.log(`player ${player} moved: ${JSON.stringify(oMsg.data)}`)
      if (gameObj.move(player, oMsg.data.from, oMsg.data.to))
        player === 'w' ? gameObj.getPlayerB().send(message.toString()) : gameObj.getPlayerW().send(message.toString())
      if (/[wbd]/.test(gameObj.getGameState())) {
        let endMessage = messages.O_GAME_OVER
        endMessage.data = gameObj.getGameState()
        gameObj.getPlayerW().send(JSON.stringify(endMessage))
        gameObj.getPlayerB().send(JSON.stringify(endMessage))
      }
    }

    if (oMsg.type === messages.T_GAME_OVER) {
      gameObj.setGameState(oMsg.data)
      gameObj.getPlayerW().send(message)
      gameObj.getPlayerB().send(message)
      //game was won by somebody, update statistics
      gameStatus.gamesCompleted++
    }
  })

  con.on('close', function (code) {
    /*
     * code 1001 means almost always closing initiated by the client;
     * source: https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent
     */
    console.log(`${con.id} disconnected ...`)

    if (code === 1001) {
      /*
       * if possible, abort the game; if not, the game is already completed
       */
      const gameObj = websockets[con.id]

      console.log(websockets)
      gameObj.setGameState(gameObj.determinePlayer(con) === 'w' ? 'b' : 'w')
      gameStatus.gamesAborted++

      /*
       * determine whose connection remains open;
       * close it
       */
      try {
        gameObj.getPlayerW().close()
        gameObj.setPlayerW(null)
      } catch (e) {
        console.log('Player W closing: ' + e)
      }

      try {
        gameObj.getPlayerB().close()
        gameObj.setPlayerB(null)
      } catch (e) {
        console.log('Player B closing: ' + e)
      }

      delete websockets[con.id]
    }
  })
})

server.listen(port)

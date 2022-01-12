const express = require('express')
const http = require('http')
const websocket = require('ws')

const indexRouter = require('./routes/index')

const port = process.argv[2]
const app = express()

app.use(express.static(__dirname + '/public'))

app.get('/play', indexRouter)
app.get('/', indexRouter)

const server = http.createServer(app)
const wss = new websocket.Server({ server })

const websockets = {}

wss.on('connection', function connection(ws) {})

server.listen(port)

var express = require('express')
var router = express.Router()

const gameStatus = require('../statTracker')

/* GET home page. */
router.get('/play', function (req, res) {
  res.sendFile('play.html', { root: './public' })
})

router.get('/', function (req, res) {
  res.render('index.ejs', {
    gamesInitialized: gameStatus.gamesInitialized,
    gamesAborted: gameStatus.gamesAborted,
    gamesCompleted: gameStatus.gamesCompleted,
  })
})

module.exports = router

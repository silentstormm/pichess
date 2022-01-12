var express = require('express')
var router = express.Router()

/* GET home page. */
router.get('/play', function (req, res) {
  res.sendFile('play.html', { root: './public' })
})

router.get('/', function (req, res) {
  res.sendFile('index.html', { root: './public' })
})

module.exports = router

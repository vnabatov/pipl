const lowdb = require('lowdb')
const express = require('express')
const FileSync = require('lowdb/adapters/FileSync')
var bodyParser = require('body-parser')

const adapter = new FileSync('db/ad.json')
const db = lowdb(adapter)

var app = express()

app.use(bodyParser.json())

app.get('/db', function (req, res) {
  res.send(db.getState())
})

app.post('/db', function (req, res) {
  db.setState(req.body).write()
  res.send(db.getState())
})

const port = 3001
app.listen(port, function () {
  console.log('db is listening on port ' + port)
})

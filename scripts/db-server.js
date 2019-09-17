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
  db.setState(req.body)
    .write()
  res.send(db.getState())
})

app.get('/tasks', function (req, res) {
  res.send(db.get('tasks'))
})

app.patch('/sprints', function (req, res) {
  db.get('sprints')
    .find({ id: req.body.id })
    .assign(req.body)
    .write()
  res.send(db.getState())
})

app.post('/tasks', function (req, res) {
  db.get('tasks')
    .push(req.body)
    .write()

  db.get('sprints')
    .find({ teamName: req.body.teamName })
    .get('columns.column-1.taskIds')
    .push(req.body.id)
    .write()

  res.send(db.getState())
})

app.patch('/tasks/:taskId', function (req, res) {
  db.get('tasks')
    .find({ id: req.params.taskId })
    .assign(req.body)
    .write()
  res.send(db.getState())
})

app.delete('/tasks/:taskId', function (req, res) {
  db.get('tasks')
    .remove({ id: req.params.taskId })
    .write()

  res.send(db.getState())
})

const port = 3001
app.listen(port, function () {
  console.log('db is listening on port ' + port)
})

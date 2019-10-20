const lowdb = require('lowdb')
const express = require('express')
const FileSync = require('lowdb/adapters/FileSync')
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')
const adapter = new FileSync('db/lowdb.json')
const db = lowdb(adapter)

const app = express()
app.use(fileUpload())
app.use(bodyParser.json())

app.get('/db', function (req, res) {
  const state = db.getState()

  const taskPostionsCache = {}
  state.sprints.forEach((sprint) => {
    Object.entries(sprint.columns).forEach(([key, column]) => {
      column.taskIds.forEach(task => {
        taskPostionsCache[task] = parseInt(key.replace('column-', ''), 10)
      })
    })
  })

  const dependendTasks = {}
  state.tasks.forEach(task => {
    if (task.related) {
      task.related.split(',').forEach(related => {
        if (!dependendTasks[related]) {
          dependendTasks[related] = []
        }
        dependendTasks[related].push(task.id)
      })
    }
  })
  res.send({ ...state, taskPostionsCache, dependendTasks })
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
  const newTaskId = req.body.id.toString()
  const tasks = db.get('tasks')
  const task = tasks
    .find({ id: newTaskId })

  if (tasks.value().length && task.value()) {
    task
      .assign(req.body)
      .write()
    res.send(req.body)
  } else {
    const newTask = req.body
    newTask.id = (newTaskId || tasks.value().length ? Math.max(...tasks.value().map(({ id }) => id)) + 1 : 1).toString()

    db.get('tasks')
      .push(newTask)
      .write()

    db.get('sprints')
      .find({ teamName: newTask.teamName })
      .get('columns.column-1.taskIds')
      .push(newTask.id)
      .write()

    res.send(newTask)
  }
})

app.patch('/columns/:columnId', function (req, res) {
  const columnId = req.params.columnId.toString()
  const { teamName, size } = req.body

  db.get('sprints')
    .find({ teamName })
    .get(`columns.${columnId}`)
    .assign({ size })
    .write()

  res.send({ teamName, columnId, size })
})

app.delete('/tasks/:taskId', function (req, res) {
  const toRemoveTaskId = req.params.taskId.toString()

  db.get('tasks')
    .remove({ id: toRemoveTaskId })
    .write()

  const sprints = db.get('sprints').value()

  const toRemove = []
  sprints.forEach(sprint => {
    const teamName = sprint.teamName
    const columns = sprint.columns
    Object.entries(columns).forEach(([colId, column]) => {
      if (column.taskIds.includes(toRemoveTaskId)) {
        toRemove.push({ columnId: column.id, teamName })
      }
    })
  })
  toRemove.length && toRemove.forEach(({ columnId, teamName }) => {
    db.get('sprints')
      .find({ teamName })
      .get(`columns.${columnId}.taskIds`)
      .pull(toRemoveTaskId)
      .write()
  })
  res.send(toRemove)
})

app.post('/upload', function (req, res) {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.')
  }
  let newDB
  let newDBParsed
  let error = ''
  try {
    newDB = req.files.dbFile.data.toString('utf8')
    newDBParsed = JSON.parse(newDB)
  } catch (e) {
    error = e
  }
  if (newDBParsed && newDB.length) {
    db.setState(newDBParsed).write()
    res.redirect('/')
  } else {
    res.write(error, newDB)
  }
})

const port = 3001
app.listen(port, function () {
  console.log('db is listening on port ' + port)
})

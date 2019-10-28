const app = require('express')()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const lowdb = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db/lowdb.json')
const moment = require('moment')
const fileUpload = require('express-fileupload')

const db = lowdb(adapter)

app.use(fileUpload())

const getDb = () => {
  const state = db.getState()

  let alreadyAdded
  const taskPostionsCache = {}
  state.sprints.forEach((sprint) => {
    alreadyAdded = []
    Object.entries(sprint.columns).forEach(([key, column]) => {
      const saveFromDuplicates = []
      column.taskIds.forEach(task => {
        if (!alreadyAdded[task]) {
          taskPostionsCache[task] = parseInt(key.replace('column-', ''), 10)
          alreadyAdded[task] = true
          saveFromDuplicates.push(task)
        }
      })
      column.taskIds = [...saveFromDuplicates]
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

  const taskStoryIndex = {}
  state.tasks.forEach(task => {
    taskStoryIndex[task.id] = task.story
  })

  const taskIndex = {}
  state.tasks.forEach(task => {
    taskIndex[task.id] = task
  })

  const storyIndex = {}
  state.stories.forEach(story => {
    storyIndex[story.id] = story
  })
  return ({ ...state, taskPostionsCache, dependendTasks, taskStoryIndex, taskIndex, storyIndex })
}

app.get('/db', function (req, res) {
  res.send(JSON.stringify(getDb()))
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

io.on('connect', function (socket) {
  console.log('connect')
  socket.emit('db', JSON.stringify(getDb()))

  socket.on('sprint:update', (data) => {
    const parsedData = JSON.parse(data)
    db.get('sprints')
      .find({ id: parsedData.id })
      .assign(parsedData)
      .write()

    const dbNew = JSON.stringify(getDb())
    socket.emit('db', dbNew)
    socket.broadcast.emit('db', dbNew)
  })

  socket.on('column:count', (data) => {
    const parsedData = JSON.parse(data)

    const { columnId, teamName, size } = parsedData

    db.get('sprints')
      .find({ teamName })
      .get(`columns.${columnId}`)
      .assign({ size })
      .write()

    const dbNew = JSON.stringify(getDb())
    socket.emit('db', dbNew)
    socket.broadcast.emit('db', dbNew)
  })

  socket.on('story:create', (data) => {
    const parsedData = JSON.parse(data)
    db.get('stories')
      .push(parsedData)
      .write()

    const dbNew = JSON.stringify(getDb())

    socket.emit('db', dbNew)
  })

  socket.on('task:update', (data) => {
    const parsedData = JSON.parse(data)

    const date = moment().format('YYYY-MM-DD')
    const time = moment().format('h:mm:ss')

    const newTaskId = parsedData.id.toString()
    const tasks = db.get('tasks')
    const task = tasks
      .find({ id: newTaskId })

    if (tasks.value().length && task.value()) {
      task
        .assign({ ...parsedData, timeChange: time, dateChange: date })
        .write()
    } else {
      const newTask = { ...parsedData, time, date }
      newTask.id = (newTaskId || tasks.value().length ? Math.max(...tasks.value().map(({ id }) => id.replace(/[0-9a-zA-Z]+-/, ''))) + 1 : 1).toString()

      db.get('tasks')
        .push(newTask)
        .write()

      db.get('sprints')
        .find({ teamName: newTask.teamName })
        .get('columns.column-1.taskIds')
        .push(newTask.id)
        .write()
    }

    console.log(parsedData)

    const dbNew = JSON.stringify(getDb())
    socket.emit('db', dbNew)
    socket.broadcast.emit('db', dbNew)
  })

  socket.on('task:delete', (data) => {
    const toRemoveTaskId = data.toString()

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

    const dbNew = JSON.stringify(getDb())
    socket.emit('db', dbNew)
    socket.broadcast.emit('db', dbNew)
  })
})

http.listen(3001, function () {
  console.log('listening on *:3001')
})

const app = require('express')()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const lowdb = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db/lowdb.json')
const moment = require('moment')
const fileUpload = require('express-fileupload')
const stringHash = require('string-hash')
const { prepareAlreadyAdded, getIssuesByFilter, loadStoriesFromJira, loadTasksFromJira } = require('./jira-utils')
const { Parser } = require('json2csv')
const { info, error } = require('./logger')

info('DB server started');

const db = lowdb(adapter)
app.use(fileUpload())

const createStory = (parsedData) => {
  db.get('stories')
    .push(parsedData)
    .write()
}

const updateTask = (parsedData) => {
  const date = moment().format('YYYY-MM-DD')
  const time = moment().format('h:mm:ss')

  const newTaskId = parsedData.id.toString()
  const oldTaskId = parsedData.oldId && parsedData.oldId.toString()
  const teamName = parsedData.teamName

  const tasks = db.get('tasks')

  info('oldTaskId, newTaskId', oldTaskId, newTaskId, teamName)

  const task = tasks
    .find({ id: oldTaskId || newTaskId })

  const taskNewIdDuplicate = tasks
    .find({ id: newTaskId })

  if (oldTaskId !== newTaskId && taskNewIdDuplicate.value()) {
    info(newTaskId, 'exists already, cant add')
    return
  }

  if (tasks.value().length && task.value()) {
    if (task.value().teamName !== parsedData.teamName) {
      const toRemove = []
      const sprints = db.get('sprints').value()

      sprints.forEach(sprint => {
        const teamName = sprint.teamName
        const columns = sprint.columns
        Object.entries(columns).forEach(([colId, column]) => {
          if (column.taskIds.includes(newTaskId)) {
            toRemove.push({ columnId: column.id, teamName })
          }
        })
      })

      toRemove.length && toRemove.forEach(({ columnId, teamName }) => {
        db.get('sprints')
          .find({ teamName })
          .get(`columns.${columnId}.taskIds`)
          .pull(newTaskId)
          .write()
      })

      info(parsedData.teamName, newTaskId)
      db.get('sprints', parsedData.teamName)
        .find({ teamName: parsedData.teamName })
        .get('columns.column-1.taskIds')
        .push(newTaskId)
        .write()
    }

    if (oldTaskId !== newTaskId) {
      const toRemove = []
      const sprints = db.get('sprints').value()

      sprints.forEach(sprint => {
        const teamName = sprint.teamName
        const columns = sprint.columns
        Object.entries(columns).forEach(([colId, column]) => {
          if (column.taskIds.includes(oldTaskId)) {
            toRemove.push({ columnId: column.id, teamName })
          }
        })
      })

      toRemove.length && toRemove.forEach(({ columnId, teamName }) => {
        db.get('sprints')
          .find({ teamName })
          .get(`columns.${columnId}.taskIds`)
          .pull(oldTaskId)
          .write()

        info('remove', `columns.${columnId}.taskIds`, oldTaskId)
        info('add', `columns.${columnId}.taskIds`, newTaskId)

        db.get('sprints')
          .find({ teamName })
          .get(`columns.${columnId}.taskIds`)
          .push(newTaskId)
          .write()
      })
    }

    task
      .assign({ ...parsedData, timeChange: time, dateChange: date, oldId: undefined })
      .write()
  } else {
    const newTask = { ...parsedData, time, date }

    if (!newTaskId || !newTaskId.length) { newTask.id = (tasks.value().length ? Math.max(...tasks.value().map(({ id }) => isNaN(id.replace(/[0-9a-zA-Z]+-/, '')) ? 0 : id.replace(/[0-9a-zA-Z]+-/, ''))) + 1 : 1).toString() }

    db.get('tasks')
      .push(newTask)
      .write()

    db.get('sprints')
      .find({ teamName: newTask.teamName })
      .get('columns.column-1.taskIds')
      .push(newTask.id)
      .write()
  }
}

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
    if (task.story && task.story.includes(' ')) {
      task.story = task.story.split(' ')[0]
    }
    if (task.story && task.story.includes(',')) {
      task.story = task.story.split(',')[0]
    }

    taskStoryIndex[task.id] = task.story
  })

  const taskIndex = {}
  state.tasks.forEach(task => {
    taskIndex[task.id] = task
  })

  const taskLastUpdate = {}
  state.tasks.forEach(task => {
    taskLastUpdate[task.id] = task['dateChange'] + task['timeChange']
  })
  const taskLastUpdateHash = stringHash(JSON.stringify(taskLastUpdate) + JSON.stringify(taskPostionsCache))

  const storyIndex = {}
  state.stories.forEach(story => {
    storyIndex[story.id] = story
  })
  return ({ ...state, taskPostionsCache, dependendTasks, taskStoryIndex, taskIndex, storyIndex, taskLastUpdate, taskLastUpdateHash })
}

app.get('/db', function (req, res) {
  res.send(JSON.stringify(getDb()))
})

app.get('/reset', function (req, res) {
  let defaultConfig = require('../db/generation-config.json')
  const newDb = { stories: [], tasks: [], sprints: [] }
  const createColumns = () => defaultConfig.sprintNames.reduce((acc, sprintName, index) => {
    acc['column-' + (index + 1)] = {
      'id': 'column-' + (index + 1),
      'title': sprintName,
      'size': '40',
      'taskIds': []
    }
    return acc
  }, {})
  newDb.sprintsMap = defaultConfig.sprintsMap
  newDb.sprintSearchForColumns = defaultConfig.sprintSearchForColumns
  defaultConfig.teams.forEach(({ id, teamName }) => {
    newDb.sprints.push({
      id,
      teamName,
      columns: createColumns(),
      'columnOrder': defaultConfig.sprintNames.map((val, key) => 'column-' + (key + 1)),
      'dirty': true
    })
  })
  db.setState(newDb).write()
  res.send('ok')
})

app.get('/dbCSV', function (req, res) {
  const { tasks, taskPostionsCache } = getDb()
  const fields = ['id', 'story', 'sp', 'summary', 'teamName', 'taskPostion', 'v', 'date', 'time', 'dateChange', 'timeChange', 'related']
  const opts = { fields }
  const parser = new Parser(opts)
  const csv = parser.parse(tasks.map(task => ({ ...task, taskPostion: taskPostionsCache[task.id] })))
  res.send(csv)
})

let loadFromJiraInProgress = false
app.get('/loadFromJira', async (req, res) => {
  info('loadFromJira')

  const jql = 'project in (ACD, RES, CPL, PRL, CMH, XDPS, LM, JPCMS, JQA, VIB, PAF, EEO, VLT, CKCS	,CCH, DS, DSS, PERT, MT, CS, XIRS, PDH, Coltrane, CPDCM, CAPI, CONV, XRV, WIMC, WMMS) AND issuetype = Epic AND cf[13699] in ("FY20-Q2","FY20-Q3","FY20-Q4", "FY21-Q1") and status!=closed'

  const jql2 = 'project in (ACD, RES, CPL, PRL, CMH, XDPS, LM, JPCMS, JQA, VIB, PAF, EEO, VLT, CKCS	,CCH, DS, DSS, PERT, MT, CS, XIRS, PDH, Coltrane, CPDCM, CAPI, CONV, XRV, WIMC, WMMS) AND issuetype in ("Technical Story", Story) AND cf[13699] in ("FY20-Q2","FY20-Q3","FY20-Q4", "FY21-Q1") and status!=closed'

  info('loadFromJira jql', jql)
  info('loadFromJira jql2', jql2)

  // const jql = 'project in (CPP0, ACD, RES, CPL, PRL) AND issuetype = Epic AND cf[13699] in ("FY20-Q2","FY20-Q3","FY20-Q4", "FY21-Q1") and status!=closed'

  // const jql = 'key=CPP0-141'
  // const jql2 = `issuetype = Task AND issueFunction in linkedIssuesOf('project in (CPP0, ACD, RES, CPL, PRL) AND issuetype = Epic AND cf[13699] in ("FY20-Q2","FY20-Q3","FY20-Q4", "FY21-Q1") and status!=closed')`

  if (!loadFromJiraInProgress) {
    loadFromJiraInProgress = true
    let newTasks = []
    let newStories = []

    try {

      const loadTasks = 'true'

      const dbJSONFile = getDb()

      prepareAlreadyAdded(dbJSONFile)

      const storiesData = await getIssuesByFilter(jql)

      info('loadStoriesFromJira')

      newStories = loadStoriesFromJira(storiesData, dbJSONFile)

      if (loadTasks === 'true') {
        info('loadTasks')

        const taskData = await getIssuesByFilter(jql2)
        newTasks = loadTasksFromJira(taskData, dbJSONFile)
      }
    } catch (e) {
      error(e)
    } finally {
      loadFromJiraInProgress = false
      const result = JSON.stringify({ newStories, newTasks, jql, jql2 })
      if (newStories.length) {
        newStories.forEach(newStory => {
          createStory(newStory)
        })
      }
      if (newTasks.length) {
        newTasks.forEach(newTask => {
          updateTask(newTask)
        })
      }
      info('load completed')
      res.send(result)
    }
  }
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
  info('connect')
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

    createStory(parsedData)
    const dbNew = JSON.stringify(getDb())

    socket.emit('db', dbNew)
  })

  socket.on('task:update', (data) => {
    const parsedData = JSON.parse(data)

    info('task:update', parsedData)
    updateTask(parsedData)

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
  info('listening on *:3001')
})

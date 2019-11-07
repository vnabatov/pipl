const moment = require('moment')
const JiraClient = require('jira-connector')
const fs = require('fs')
const dbFileName = 'db/lowdb.json'
const dbJSON = require('../db/lowdb.json')
const { host, username, password } = require('./config/jira.config.json')

const {
  loadTasks = false,
  maxResults = 1000,
  jql = 'project = CPP0 AND issuetype = Story AND "Planned In" = FY20-Q3 AND status not in (Closed)',
  jql2 = `issuetype = Task AND issueFunction in linkedIssuesOf('project = CPP0 AND issuetype = Story AND "Planned In" = FY20-Q3 AND status not in (Closed)') AND project not in ('WMMS', 'WIMC', 'PDH') AND status not in (Closed)`
} = require('yargs').argv

const jira = new JiraClient({ host, basic_auth: { username, password } })
const getIssuesByFilter = async (jql) => jira.search.search({ jql, maxResults })
const alreadyAdded = []
const date = moment().format('YYYY-MM-DD')
const time = moment().format('h:mm:ss')

console.log({ maxResults, loadTasks, jql, jql2 })

const prepareAlreadyAdded = () => {
  dbJSON.stories.forEach(({ id }) => {
    alreadyAdded.push(id)
  })

  dbJSON.tasks.forEach(({ id }) => {
    alreadyAdded.push(id)
  })
}

const loadStoriesFromJira = (jiraData) => {
  const newStories = jiraData.issues.map(({ key, fields: { summary, customfield_11220: epicId } }) => ({ id: key, summary, epicId }))

  newStories.forEach(story => {
    if (!alreadyAdded.includes(story.id)) {
      dbJSON.stories.push({ ...story, date, time })
      alreadyAdded.push(story.id)
      console.log('Added:', story.id)
    } else {
      console.log('Already exists:', story.id)
    }
  })
}

const loadTasksFromJira = (jiraData) => {
  jiraData.issues.forEach(task => {
    const teamId = task.key.split('-')[0]
    let sprint = dbJSON.sprints.find(({ id }) => id === teamId)

    if (!sprint) {
      console.log('sprint not found, trying default')
      sprint = dbJSON.sprints.find(({ id }) => id === 'default')
    }

    if (sprint) {
      if (!alreadyAdded.includes(task.key) && task.status !== 'Closed') {
        let taskSprint = ''
        try {
          taskSprint = /.+name=([^,]+)/.exec(task.fields.customfield_10942)[1]
        } catch (e) {
          console.log(`can't get a sprint`, e)
        }

        let version = ''
        if (task.fields.fixVersions.length) {
          try {
            version = task.fields.fixVersions.map(({ name }) => name).join(',')
          } catch (e) {
            console.log(`can't get a version`, e)
          }
        }

        let storyKey = task.fields.customfield_16525
        try {
          if (!storyKey && task.fields.issueLinks.length) {
            task.fields.issueLinks.forEach(issueLink => {
              if (issueLink.type.name === 'Story') {
                storyKey = issueLink.id
              }
            })
          }
        } catch (e) {
          console.log(`can't get a story key`, e)
        }

        const taskData = {
          id: task.key,
          summary: task.fields.summary,
          story: storyKey,
          related: '',
          sp: '',
          date,
          time,
          dateChange: date,
          timeChange: time,
          v: version,
          sprint: taskSprint
        }

        dbJSON.tasks.push({ ...taskData, teamName: sprint.teamName, status: undefined })
        sprint.columns[(dbJSON.sprintMap && taskSprint && dbJSON.sprintMap[taskSprint]) || 'column-1'].taskIds.push(taskData.id)
        alreadyAdded.push(taskData.id)
        console.log('sprint (team) = [', sprint && sprint.teamName, '] task =', taskData.id)
      } else {
        console.log('Already exists: sprint (team) = [', sprint && sprint.teamName, '] task =', task.key)
      }
    } else {
      console.log('sprint not found')
    }
  })
}

const main = async () => {
  const hrstart = process.hrtime()

  prepareAlreadyAdded()

  const storiesData = await getIssuesByFilter(jql)

  console.log('loadStoriesFromJira')

  loadStoriesFromJira(storiesData)

  if (loadTasks === 'true') {
    console.log('loadTasks')

    const taskData = await getIssuesByFilter(jql2)
    loadTasksFromJira(taskData)
  }

  fs.writeFile(dbFileName, JSON.stringify(dbJSON), function (err) {
    if (err) return console.log(err)
    console.log('writing to ' + dbFileName)
  })

  const hrend = process.hrtime(hrstart)

  console.info('Execution time: %ds %dms', hrend[0], hrend[1] / 1000000)
}

main()

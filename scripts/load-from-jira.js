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
  linkType = 'Task'
} = require('yargs').argv

const jira = new JiraClient({ host, basic_auth: { username, password } })
const getIssuesByFilter = async (jql) => jira.search.search({ jql, maxResults })
const alreadyAdded = []
const date = moment().format('YYYY-MM-DD')
const time = moment().format('h:mm:ss')

console.log({ maxResults, loadTasks, jql, linkType })

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
  jiraData.issues.forEach(issue => {
    const tasks = issue.fields.issuelinks.filter(link => [...linkType.split(',')].includes(link.type.name) && link.inwardIssue).map(link => {
      return ({
        id: link.inwardIssue.key,
        summary: link.inwardIssue.fields.summary,
        story: issue.key,
        related: '',
        sp: '',
        date,
        time,
        dateChange: date,
        timeChange: time,
        status: link.inwardIssue.fields.status.name
      })
    })
    tasks.forEach(task => {
      const teamId = task.id.split('-')[0]
      const sprint = dbJSON.sprints.find(({ id }) => id === teamId)

      if (sprint) {
        if (!alreadyAdded.includes(task.id) && task.status !== 'Closed') {
          dbJSON.tasks.push({ ...task, teamName: sprint.teamName, status: undefined })
          sprint.columns['column-1'].taskIds.push(task.id)
          alreadyAdded.push(task.id)
          console.log('sprint (team) = [', sprint && sprint.teamName, '] task =', task.id)
        } else {
          console.log('Already exists: sprint (team) = [', sprint && sprint.teamName, '] task =', task.id)
        }
      }
    })
  })
}

async function asyncForEach (array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

const main = async () => {
  const hrstart = process.hrtime()

  prepareAlreadyAdded()

  const jiraData = await getIssuesByFilter(jql)

  loadStoriesFromJira(jiraData)

  if (loadTasks) {
    loadTasksFromJira(jiraData)

    await asyncForEach(dbJSON.tasks, async (task) => {
      try {
        if (task && task.id) {
          const taskData = await getIssuesByFilter(`key=${task.id}`)
          if (taskData) {
            const ver = taskData.issues[0].fields.fixVersions[0].name
            dbJSON.tasks.find(({ id }) => (id === task.id)).v = ver
            console.log('set version', task.id, ver)
          }
        }
      } catch (e) {
        // console.log(e)
      }
    })
  }

  fs.writeFile(dbFileName, JSON.stringify(dbJSON), function (err) {
    if (err) return console.log(err)
    console.log('writing to ' + dbFileName)
  })

  const hrend = process.hrtime(hrstart)

  console.info('Execution time: %ds %dms', hrend[0], hrend[1] / 1000000)
}

main()

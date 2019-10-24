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
const date = moment().format('yyyy-mm-dd')

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
      dbJSON.stories.push({ ...story, date })
      alreadyAdded.push(story.id)
    }
  })
}

const loadTasksFromJira = (jiraData) => {
  jiraData.issues.forEach(issue => {
    const tasks = issue.fields.issuelinks.filter(link => [...linkType.split(',')].includes(link.type.name) && link.inwardIssue).map(link => ({
      id: link.inwardIssue.key,
      summary: link.inwardIssue.fields.summary,
      story: issue.key,
      related: '',
      sp: '',
      date
    }))

    tasks.forEach(task => {
      const teamId = task.id.split('-')[0]
      const sprint = dbJSON.sprints.find(({ id }) => id === teamId)

      console.log('sprint (team)', sprint && sprint.teamName, 'task', task.id)

      if (sprint) {
        if (!alreadyAdded.includes(task.id)) {
          dbJSON.tasks.push({ ...task, teamName: sprint.teamName })
          sprint.columns['column-1'].taskIds.push(task.id)
          alreadyAdded.push(task.id)
        }
      }
    })
  })
}
const main = async () => {
  prepareAlreadyAdded()

  const jiraData = await getIssuesByFilter(jql)

  loadStoriesFromJira(jiraData)

  if (loadTasks) {
    loadTasksFromJira(jiraData)
  }

  fs.writeFile(dbFileName, JSON.stringify(dbJSON), function (err) {
    if (err) return console.log(err)
    console.log('writing to ' + dbFileName)
  })
}

main()

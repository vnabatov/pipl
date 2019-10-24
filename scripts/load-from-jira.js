const moment = require('moment')
const JiraClient = require('jira-connector')
const fs = require('fs')
const dbFileName = 'db/lowdb.json'
const dbJSON = require('../db/lowdb.json')
const { host, username, password } = require('./config/jira.config.json')

const {
  loadTasks = false,
  maxResults = 1000,
  jqlEpics = 'project = "AS" AND issuetype = Epic AND "Program Increment" = FY20ASPI2',
  jqlStories = 'project = "AS" AND issuetype != Epic AND "Program Increment" = FY20ASPI2',
  // jql = 'project = "AS" AND "Program Increment" = FY20ASPI2',
  // jql = 'issuekey = AS-14741',
  linkType = 'Task'
} = require('yargs').argv

const jira = new JiraClient({ host, basic_auth: { username, password } })
const getIssuesByFilter = async (jql) => jira.search.search({ jql, maxResults })
const alreadyAdded = []
const date = moment().format('YYYY-MM-DD')
const time = moment().format('h:mm:ss')

console.log({ maxResults, loadTasks, jqlEpics, jqlStories, linkType })

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

  return jiraData.issues.map(i => i.key)
}

const loadTasksFromJira = (jiraData) => {
  const tasks = jiraData.issues.map(item => ({
    id: item.key,
    summary: item.fields.summary,
    story: item.fields.customfield_11220,
    related: '',
    sp: '',
    teamId: item.fields.customfield_17122 && item.fields.customfield_17122.value,
    date,
    time,
    dateChange: date,
    timeChange: time
  }))

  tasks.forEach(task => {
    const teamId = task.teamId || 'Unassigned'
    const sprint = dbJSON.sprints.find(({id}) => id === teamId)

    console.log('sprint (team) = [', sprint && sprint.teamName, '] task =', task.id)

    if (sprint) {
      if (!alreadyAdded.includes(task.id)) {
        dbJSON.tasks.push({...task, teamName: sprint.teamName})
        sprint.columns['column-0'].taskIds.push(task.id)
        alreadyAdded.push(task.id)
      } else {
        console.log('Already exists: sprint (team) = [', sprint && sprint.teamName, '] task =', task.id)
      }
    }
  })
}

const main = async () => {
  const hrstart = process.hrtime()

  prepareAlreadyAdded()

  const jiraDataEpics = await getIssuesByFilter(jqlEpics)

  const epics = loadStoriesFromJira(jiraDataEpics)

  if (loadTasks) {
    const jqlStoriesForEpics = `project = "AS" AND (issuetype != Epic AND "Program Increment" = FY20ASPI2 OR "Epic Link" IN (${epics.join(', ')}))`
    console.log(jqlStoriesForEpics)
    const jiraDataStories = await getIssuesByFilter(jqlStoriesForEpics)
    const tasks = loadTasksFromJira(jiraDataStories)
    console.log(tasks)
  }

  fs.writeFile(dbFileName, JSON.stringify(dbJSON), function (err) {
    if (err) return console.log(err)
    console.log('writing to ' + dbFileName)
  })

  const hrend = process.hrtime(hrstart)

  console.info('Execution time: %ds %dms', hrend[0], hrend[1] / 1000000)
}

main()

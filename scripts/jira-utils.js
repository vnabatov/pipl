const moment = require('moment')
const JiraClient = require('jira-connector')
const { host, username, password } = require('./config/jira.config.json')

const {
  loadTasks = false,
  maxResults = 1000,
  updateDbDirectly = false,
  jql = 'key=CPP0-1061',
  jql2 = `issuetype = Task AND issueFunction in linkedIssuesOf('key=CPP0-1061')`
} = require('yargs').argv

const jira = new JiraClient({ host, basic_auth: { username, password } })
const getIssuesByFilter = async (jql) => jira.search.search({ jql, maxResults })
let alreadyAdded = []
const date = moment().format('YYYY-MM-DD')
const time = moment().format('h:mm:ss')

console.log({ maxResults, loadTasks, jql, jql2 })

const prepareAlreadyAdded = (dbJSON) => {
  alreadyAdded = []
  dbJSON.stories.forEach(({ id }) => {
    alreadyAdded.push(id)
  })

  dbJSON.tasks.forEach(({ id }) => {
    alreadyAdded.push(id)
  })
}

const loadStoriesFromJira = (jiraData, dbJSON) => {
  const storiesFromJira = jiraData.issues.map(({ key, fields: { summary, customfield_11220: epicId } }) => ({ id: key, summary, epicId }))
  const newStories = []
  storiesFromJira.forEach(story => {
    if (!alreadyAdded.includes(story.id)) {
      if (updateDbDirectly) {
        dbJSON.stories.push({ ...story, date, time })
      }

      newStories.push({ ...story, date, time })

      alreadyAdded.push(story.id)
      console.log('Added:', story.id)
    } else {
      console.log('Already exists:', story.id)
    }
  })
  return newStories
}

const loadTasksFromJira = (jiraData, dbJSON) => {
  const newTasks = []

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

        if (updateDbDirectly) {
          dbJSON.tasks.push({ ...taskData, teamName: sprint.teamName, status: undefined })
          sprint.columns[(dbJSON.sprintMap && taskSprint && dbJSON.sprintMap[taskSprint]) || 'column-1'].taskIds.push(taskData.id)

          console.log('sprint (team) = [', sprint && sprint.teamName, '] task =', taskData.id)
        }

        newTasks.push({ ...taskData, teamName: sprint.teamName, status: undefined })

        alreadyAdded.push(taskData.id)
      } else {
        console.log('Already exists: sprint (team) = [', sprint && sprint.teamName, '] task =', task.key)
      }
    } else {
      console.log('sprint not found')
    }
  })
  return newTasks
}

module.exports = { prepareAlreadyAdded, getIssuesByFilter, loadStoriesFromJira, loadTasksFromJira }

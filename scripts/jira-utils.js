const moment = require('moment')
const JiraClient = require('jira-connector')
const dbJSON = require('../db/lowdb.json')
const { host, username, password } = require('./config/jira.config.json')

const {
  maxResults = 1000,
  linkType = 'Task'
} = require('yargs').argv

const jira = new JiraClient({ host, basic_auth: { username, password } })
const getIssuesByFilter = async (jql) => jira.search.search({ jql, maxResults })
const alreadyAdded = []
const date = moment().format('YYYY-MM-DD')
const time = moment().format('h:mm:ss')

const prepareAlreadyAdded = () => {
  dbJSON.stories.forEach(({ id }) => {
    alreadyAdded.push(id)
  })

  dbJSON.tasks.forEach(({ id }) => {
    alreadyAdded.push(id)
  })

  return alreadyAdded
}

const loadStoriesFromJira = (jiraData) => {
  const stories = jiraData.issues.map(({ key, fields: { summary, customfield_11220: epicId } }) => ({ id: key, summary, epicId }))
  const newStories = []
  stories.forEach(story => {
    if (!alreadyAdded.includes(story.id)) {
      alreadyAdded.push(story.id)
      newStories.push(story)
      console.log('Added:', story.id)
    } else {
      console.log('Already exists:', story.id)
    }
  })

  return newStories
}

const loadTasksFromJira = (jiraData) => {
  let tasks
  jiraData.issues.forEach(issue => {
    tasks = issue.fields.issuelinks.filter(link => [...linkType.split(',')].includes(link.type.name) && link.inwardIssue).map(link => {
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
  })
  return tasks
}

async function asyncForEach (array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

module.exports = { prepareAlreadyAdded, getIssuesByFilter, loadStoriesFromJira, loadTasksFromJira, asyncForEach }

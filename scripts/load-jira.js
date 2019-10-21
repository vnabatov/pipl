const JiraClient = require('jira-connector')
const fs = require('fs')
const dbFileName = 'db/lowdb.json'
const dbJSON = require('../db/lowdb.json')

const { host, username, password } = require('./config/jira.config.json')

const jira = new JiraClient({ host, basic_auth: { username, password } })

const getIssuesByFilter = async (jql) => jira.search.search({ jql })

const main = async () => {
  const result = await getIssuesByFilter('project=CPP0 and issuetype=Story and Sprint="FY20 Sprint 8" and key=CPP0-1548')
  dbJSON.stories = result.issues.map(({ key, fields: { summary, customfield_11220: epicId } }) => ({ id: key, summary, epicId }))
  result.issues.forEach(issue => {
    const tasks = issue.fields.issuelinks.filter(link => link.type.name === 'Task' && link.inwardIssue).map(link => ({
      id: link.inwardIssue.key,
      summary: link.inwardIssue.fields.summary,
      story: issue.key,
      related: '',
      sp: ''
    }))

    tasks.forEach(task => {
      const teamId = task.id.split('-')[0]
      const sprint = dbJSON.sprints.find(({ id }) => id === teamId)
      console.log(teamId, sprint && sprint.teamName)
      if (sprint) {
        dbJSON.tasks.push({ ...task, teamName: sprint.teamName })
        sprint.columns['column-1'].taskIds.push(task.id)
      }
    })
  })
  fs.writeFile(dbFileName, JSON.stringify(dbJSON), function (err) {
    if (err) return console.log(err)
    console.log('writing to ' + dbFileName)
  })
}

main()

const JiraClient = require('jira-connector')
const fs = require('fs')
const dbFileName = 'db/lowdb.json'
const dbJSON = require('../db/lowdb.json')

const { host, username, password } = require('./config/jira.config.json')

const jira = new JiraClient({ host, basic_auth: { username, password } })

const getIssuesByFilter = async (jql) => jira.search.search({ jql })

const main = async () => {
  const result = await getIssuesByFilter('project=CPP0 and issuetype=Story and Sprint="FY20 Sprint 8"')
  dbJSON.stories = result.issues.map(({ key, fields: { summary } }) => ({ id: key, summary }))
  fs.writeFile(dbFileName, JSON.stringify(dbJSON), function (err) {
    if (err) return console.log(err)
    console.log('writing to ' + dbFileName)
  })
}

main()

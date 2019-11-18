const fs = require('fs')
const dbFileName = 'db/lowdb.json'
const { prepareAlreadyAdded, getIssuesByFilter, loadStoriesFromJira, loadTasksFromJira } = require('./jira-utils')
const dbJSONFile = require('../db/lowdb.json')

const {
  loadTasks = false,
  maxResults = 1000,
  jql = 'key=CPP0-1061',
  jql2 = `issuetype = Task AND issueFunction in linkedIssuesOf('key=CPP0-1061')`
} = require('yargs').argv

console.log({ maxResults, loadTasks, jql, jql2 })

const main = async () => {
  const hrstart = process.hrtime()

  prepareAlreadyAdded(dbJSONFile)

  const storiesData = await getIssuesByFilter(jql, dbJSONFile)

  console.log('loadStoriesFromJira')

  const newStories = loadStoriesFromJira(storiesData, dbJSONFile)
  let newTasks = {}

  if (loadTasks === 'true') {
    console.log('loadTasks')

    const taskData = await getIssuesByFilter(jql2)
    newTasks = loadTasksFromJira(taskData, dbJSONFile)
  }

  fs.writeFile(dbFileName, JSON.stringify(dbJSONFile), function (err) {
    if (err) return console.log(err)
    console.log('writing to ' + dbFileName)
  })

  const hrend = process.hrtime(hrstart)

  console.log('newTasks')
  console.log(newTasks)
  console.log('newStories')
  console.log(newStories)
  console.info('Execution time: %ds %dms', hrend[0], hrend[1] / 1000000)
}

main()

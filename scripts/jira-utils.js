const moment = require('moment')
const JiraClient = require('jira-connector')
const { host, username, password } = require('./config/jira.config.json')
const { info, debug } = require('./logger')

const {
  loadTasks = false,
  maxResults = 1000,
  updateDbDirectly = true,
  jql = 'key=CPP0-1061',
  jql2 = `issuetype = Task AND issueFunction in linkedIssuesOf('key=CPP0-1061')`
} = require('yargs').argv

const jira = new JiraClient({ host, basic_auth: { username, password } })
const getIssuesByFilter = async (jql) => jira.search.search({ jql, maxResults })
let alreadyAdded = []
const date = moment().format('YYYY-MM-DD')
const time = moment().format('h:mm:ss')

info('Jira Utils', { maxResults, loadTasks, jql, jql2 })

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
  const storiesFromJira = jiraData.issues.map(({ key, fields: { summary, customfield_18237: bu, customfield_11220: epicId, issuelinks } }) => 
  ({ id: key, summary, epicId, issuelinks, bu: bu && bu.value }))
  const newStories = []
  storiesFromJira.forEach(story => {
    if (!alreadyAdded.includes(story.id)) {
      const relatedIssues = []
      
      // const relatedIssueTypes = []
      // const checkRelations = []
      // const ignoreWithTextInSummary = ''

      /*
      story.issuelinks.length && story.issuelinks.forEach(issuelink => {
        const issue = getInwardOutwardIssue(issuelink)
        const relation = issuelink.type[issue.relationIO]

        debug('   add link', issue.key, '?')

        if (!relatedIssueTypes.includes(issue.fields.issuetype.name)) {
          debug(`   ! Skipped ${issue.key} by IssueType [[${issue.fields.issuetype.name}]]`)
        } else if (checkRelations.length !== 0 && !checkRelations.includes(relation)) {
          debug(`   ! Skipped ${issue.key} by Relation Type ${relation}`)
        } else if (ignoreWithTextInSummary !== '' && issue.fields.summary.includes(ignoreWithTextInSummary)) {
          debug(`   ! Skipped ${issue.key} by Text in Summary ${issue.fields.summary} / '${ignoreWithTextInSummary}'`)
        } else if (issue.fields.status.name === 'Closed') {
          debug('   skipped by status', 'Closed')
        } else {
          debug('   Yes - add', issue.key)
          relatedIssues.push(issue.key)
        }
      })
      */

      story.issuelinks = undefined

      newStories.push({ ...story, date, time, relatedIssues })

      alreadyAdded.push(story.id)
      debug('Added Epic:', story.id)
    } else {
      debug('Epic Already exists:', story.id)
    }
  })
  return newStories
}

const getInwardOutwardIssue = (issuelink, inwardIssues = true, outwardIssues = true) => {
  if (outwardIssues && issuelink.outwardIssue) {
    return { ...issuelink.outwardIssue, relationIO: 'outward' }
  }
  if (inwardIssues && issuelink.inwardIssue) {
    return { ...issuelink.inwardIssue, relationIO: 'inward' }
  }
  return null
}

// deprecated
const getSprintRowByJiraKey = (task, dbJSON) => {
  const teamId = task.key.split('-')[0]
  return dbJSON.sprints.find(({ id }) => id === teamId) || dbJSON.sprints.find(({ id }) => id === 'default')
} 

const getSprintRowByJiraTeam = (task, dbJSON) => {
  const teamId = task.fields.customfield_13593 && task.fields.customfield_13593[0] ? task.fields.customfield_13593[0].value : ''
  debug('teamId=', teamId)
  return dbJSON.sprints.find(({ id }) => id === teamId) || dbJSON.sprints.find(({ id }) => id === 'default')
} 

const loadTasksFromJira = (jiraData, dbJSON) => {
  const newTasks = []

  jiraData.issues.forEach(task => {
    const sprint = getSprintRowByJiraTeam(task, dbJSON)

    debug('sprint.id=', sprint.id)

    if (sprint) {
      let taskSprint = ''
      try {
        taskSprint = task.fields.customfield_10942 && task.fields.customfield_10942.length ? /.+name=([^,]+)/.exec(task.fields.customfield_10942[task.fields.customfield_10942.length - 1])[1] : ''
        debug('taskSprint=', taskSprint)
      } catch (e) {
        debug(`can't get a sprint`, e)
      }

      let version = ''
      if (task.fields.fixVersions.length) {
        try {
          version = task.fields.fixVersions.map(({ name }) => name).join(',')
          debug('version=', version)
        } catch (e) {
          debug(`can't get a version`, e)
        }
      }

      let storyKey = task.fields.customfield_11220

      const issueLinks = task.fields.issuelinks
      const relatedIssueTypes = ['Task', 'Technical', 'Technical Story', 'Story', 'Task', 'Bug']
      const checkRelations = []
      const ignoreWithTextInSummary = ''
      const relatedIssues = []

      issueLinks.forEach(issuelink => {
        const issue = getInwardOutwardIssue(issuelink)
        const relation = issuelink.type[issue.relationIO]
        
        debug('   add link', issue.key, '?')

        if (!relatedIssueTypes.includes(issue.fields.issuetype.name)) {
          debug(`   ! Skipped ${issue.key} by IssueType [[${issue.fields.issuetype.name}]]`)
        } else if (checkRelations.length !== 0 && !checkRelations.includes(relation)) {
          debug(`   ! Skipped ${issue.key} by Relation Type ${relation}`)
        } else if (ignoreWithTextInSummary !== '' && issue.fields.summary.includes(ignoreWithTextInSummary)) {
          debug(`   ! Skipped ${issue.key} by Text in Summary ${issue.fields.summary} / '${ignoreWithTextInSummary}'`)
        } else if (issue.fields.status.name === 'Closed') {
          debug('   skipped by status', 'Closed')
        } else {
          debug('   Yes - add', issue.key)
          relatedIssues.push(issue.key)
        }
      })

      const taskData = {
        id: task.key,
        summary: task.fields.summary,
        story: storyKey,
        related: relatedIssues.length ? relatedIssues.join(',') : '',
        sp: task.fields.customfield_10223 || '',
        date,
        components: task.fields.components && task.fields.components.length && task.fields.components.map(({ name }) => name),
        time,
        bu: task.fields.customfield_18237 && task.fields.customfield_18237.value || '',
        dateChange: date,
        timeChange: time,
        v: version,
        sprint: taskSprint
      }

      const getSprintToColumn = (sprintName) => {
        if (!sprintName || !sprintName.includes) {
          return null
        }

        if (dbJSON.sprintSearchForColumns) {
          let targetColumn = null
          Object.entries(dbJSON.sprintSearchForColumns).forEach(([search, column]) => {
            if (!targetColumn && sprintName.includes(search)) {
              debug(`getSprintToColumn: sprintName="${sprintName}" search="${search}" targetColumn="${column}"`)
              targetColumn = column
            }
          })
          return targetColumn
        }
      }
      const newSprintColumn = getSprintToColumn(taskSprint) || 'column-1'

      if (!alreadyAdded.includes(task.key) && task.status !== 'Closed') {
        if (updateDbDirectly) {
          dbJSON.tasks.push({ ...taskData, teamName: sprint.teamName, status: undefined })
          sprint.columns[newSprintColumn].taskIds.push(taskData.id)
          debug('sprint (team) = [', sprint.teamName, '] task =', taskData.id, newSprintColumn, JSON.stringify(dbJSON.sprint))
        }

        newTasks.push({ ...taskData, teamName: sprint.teamName, status: undefined })

        alreadyAdded.push(taskData.id)
      } else {
        debug('Already exists: sprint (team) = [', sprint && sprint.teamName, '] task =', task.key)

        Object.entries(sprint.columns).forEach(([key, val]) => {
          if (val.taskIds && val.taskIds.includes(taskData.id)) {
            sprint.columns[key].taskIds = val.taskIds.filter(id => id !== taskData.id)
          }
        })
        sprint.columns[newSprintColumn].taskIds.push(taskData.id)
      }
    } else {
      debug('sprint not found')
    }
  })
  return newTasks
}

module.exports = { prepareAlreadyAdded, getIssuesByFilter, loadStoriesFromJira, loadTasksFromJira }

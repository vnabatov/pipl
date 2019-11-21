import React from 'react'
import SprintsTable from './SprintsTable'
import 'react-date-range/dist/styles.css'
import 'react-date-range/dist/theme/default.css'

export default ({ tasks, taskFilter, sprints, setData }) => {
  let filteredTasks
  if (taskFilter.length) {
    if (taskFilter[0] === '/') {
      filteredTasks = tasks.filter(task => [task.id, task.summary, task.story, task.v].map(search => (new RegExp(taskFilter).test(search)).includes(true)))
    } else {
      filteredTasks = tasks.filter(task => [task.id, task.summary.toLowerCase(), task.story, task.v].map(search => search && search.includes(taskFilter.toLowerCase())).includes(true))
    }
  }

  return (
    <div key='sprint-container'>
      {sprints.map((sprint, key) => (
        <SprintsTable
          setData={setData}
          key={key + sprint.teamName}
          tasksDb={taskFilter.length ? filteredTasks : tasks}
          sprintDb={sprint}
        />
      ))}
    </div>
  )
}

import React from 'react'
import SprintsTable from './SprintsTable'
import 'react-date-range/dist/styles.css'
import 'react-date-range/dist/theme/default.css'

export default ({ tasks, componentFilter, taskFilter, BUFilter, sprints, setData }) => {
  let filteredTasks = tasks
  if (taskFilter.length) {
    if (taskFilter[0] === '/') {
      filteredTasks = tasks.filter(task => [task.id, task.summary, task.story, task.v].map(search => (new RegExp(taskFilter).test(search)).includes(true)))
    } else {
      filteredTasks = tasks.filter(task => [task.id, task.summary.toLowerCase(), task.story, task.v].map(search => search && search.includes(taskFilter.toLowerCase())).includes(true))
    }
  }

  if (BUFilter && BUFilter !== 'All') {
    if (BUFilter === 'Empty') {
      filteredTasks = tasks.filter(task => !task.bu)
    } else {
      filteredTasks = tasks.filter(task => task.bu === BUFilter)
    }
  }

  if (componentFilter && componentFilter.length) {
    filteredTasks = tasks.filter(task => {
      let show = !task.components || task.components.length === 0
      componentFilter.forEach(filter => {
        if (show || task.components.includes(filter.value)) {
          show = true
        }
      })
      return show
    })
  }

  return (
    <div key='sprint-container'>
      {sprints.map((sprint, key) => (
        <SprintsTable
          setData={setData}
          key={key + sprint.teamName}
          tasksDb={filteredTasks}
          sprintDb={sprint}
        />
      ))}
    </div>
  )
}

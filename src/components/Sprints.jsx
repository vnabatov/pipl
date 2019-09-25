import React from 'react'
import SprintsTable from './SprintsTable'

export default ({ tasks, sprints, setData }) => (
  sprints.map((sprint, key) => (
    <SprintsTable
      setData={setData}
      key={key}
      tasksDb={tasks}
      sprintDb={sprint}
    />
  ))
)

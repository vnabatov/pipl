import React, { useState } from 'react'
import styled from 'styled-components'
import SprintsTable from './SprintsTable'
import { DateRangePicker } from 'react-date-range'
import 'react-date-range/dist/styles.css'
import 'react-date-range/dist/theme/default.css'
import use from 'react-hoox'
import moment from 'moment'
import { UnmountClosed } from 'react-collapse'

const PanelName = styled.div`
cursor: pointer;
&:hover {
  font-weight: bold;
}
`
const createdDate = {
  startDate: null,
  endDate: null,
  key: 'created'
}
const modifiedDate = {
  startDate: null,
  endDate: null,
  key: 'modified'
}
let taskFilter = ''

export default ({ tasks, sprints, setData }) => {
  const [isOpened, setOpened] = useState(false)

  use(() => createdDate)
  use(() => modifiedDate)
  use(() => taskFilter)

  const dateCreateRangeUpdate = (update) => {
    createdDate.startDate = update.created.startDate
    createdDate.endDate = update.created.endDate
  }

  const dateModifiedRangeUpdate = (update) => {
    modifiedDate.startDate = update.modified.startDate
    modifiedDate.endDate = update.modified.endDate
  }

  let filteredTasks = Object.assign(tasks)
  // todo: fix bug for stat of the month, potentially timezone problem
  if (modifiedDate.startDate !== null) {
    filteredTasks = filteredTasks.filter(task => task.dateChange && moment(new Date(task.dateChange + ' ' + task.timeChange)).date() >= moment(modifiedDate.startDate).date())
  }

  if (modifiedDate.endDate !== null) {
    filteredTasks = filteredTasks.filter(task => task.dateChange && moment(new Date(task.dateChange + ' ' + task.timeChange)).date() <= moment(modifiedDate.endDate).date())
  }

  if (createdDate.startDate !== null) {
    filteredTasks = filteredTasks.filter(task => moment(new Date(task.date + ' ' + task.time)).date() >= moment(createdDate.startDate).date())
  }

  if (createdDate.endDate !== null) {
    filteredTasks = filteredTasks.filter(task => moment(new Date(task.date + ' ' + task.time)).date() <= moment(createdDate.endDate).date())
  }

  if (taskFilter.length) {
    if (taskFilter[0] === '/') {
      filteredTasks = filteredTasks.filter(task => [task.id, task.summary, task.story, task.v].map(search => (new RegExp(taskFilter).test(search)).includes(true)))
    } else {
      filteredTasks = filteredTasks.filter(task => [task.id, task.summary, task.story, task.v].map(search => search && search.includes(taskFilter)).includes(true))
    }
  }

  return (
    <div>
      <PanelName onClick={() => setOpened(!isOpened)}>{isOpened ? '▼' : '►'} Task Filter {taskFilter.length ? '🔣' : ''}</PanelName>

      <UnmountClosed isOpened={isOpened}>
        <input type='text' className='input' placeholder='Task Id / Story Id / Task Summary / Version / Regexp(start with "/")'defaultValue={taskFilter} onChange={(e) => (taskFilter = e.target.value)} />

        <details>
          <summary>Created {createdDate.startDate !== null || createdDate.endDate !== null ? '⏲️' : ''}</summary>
          <DateRangePicker
            ranges={[createdDate]}
            onChange={dateCreateRangeUpdate}
          />
          <div className='button' onClick={() => {
            createdDate.startDate = null
            createdDate.endDate = null
          }} >Reset</div>
        </details>

        <details>
          <summary>Modified {modifiedDate.startDate !== null || modifiedDate.endDate !== null ? '⏲️' : ''}</summary>
          <DateRangePicker
            ranges={[modifiedDate]}
            onChange={dateModifiedRangeUpdate}
          />
          <div className='button' onClick={() => {
            modifiedDate.startDate = null
            modifiedDate.endDate = null
          }} >Reset</div>
        </details>

        <hr />
      </UnmountClosed>

      {sprints.map((sprint, key) => (
        <SprintsTable
          setData={setData}
          key={key}
          tasksDb={filteredTasks}
          sprintDb={sprint}
        />
      ))}
    </div>
  )
}

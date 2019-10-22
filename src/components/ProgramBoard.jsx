import React from 'react'
import styled from 'styled-components'
import AppContext from '../AppContext'
import ProgramBoardColumn from './ProgramBoardColumn'

const SprintTable = styled.div`
display: flex;
flex: 1;
justify-content: space-between;
`
const TeamName = styled.div`
min-width:150px
`

export default ({ stories, tasks, sprints }) => {
  const storySprint = {
    'id': '0',
    'teamName': 'Stories',
    'columns': {
      'column-1': {
        'id': 'column-1',
        'title': 'Backlog',
        'taskIds': []
      },
      'column-2': {
        'id': 'column-2',
        'title': 'Sprint 1',
        'taskIds': []
      },
      'column-3': {
        'id': 'column-3',
        'title': 'Sprint 2',
        'taskIds': []
      },
      'column-4': {
        'id': 'column-4',
        'title': 'Sprint 3',
        'taskIds': []
      },
      'column-5': {
        'id': 'column-5',
        'title': 'Sprint 4',
        'size': '40',
        'taskIds': []
      },
      'column-6': {
        'id': 'column-6',
        'title': 'Sprint 5',
        'size': '40',
        'taskIds': []
      }
    },
    'columnOrder': [
      'column-1',
      'column-2',
      'column-3',
      'column-4',
      'column-5',
      'column-6'
    ]
  }
  return (
    <AppContext.Consumer>{() => (
      <details open>
        <summary>Program board</summary>
        <div>
          <SprintTable>
            <TeamName>Stories</TeamName>
            {storySprint.columnOrder.map((columnId) => {
              const column = storySprint.columns[columnId]
              const sprintTasks = column.taskIds.map(taskId => tasks.filter(task => task.id === taskId)[0] || { id: taskId, summary: 'not found' })
              return <ProgramBoardColumn
                key={column.id}
                title={column.title}
                stories={stories}
                tasks={sprintTasks}
              />
            })}
          </SprintTable>

          {sprints && tasks && sprints.map(sprint => <div><SprintTable><TeamName>{sprint.teamName}</TeamName>
            {sprint.columnOrder.map((columnId) => {
              const column = sprint.columns[columnId]
              const sprintTasks = column.taskIds.map(taskId => tasks.filter(task => task.id === taskId)[0] || { id: taskId, summary: 'not found' })
              return <ProgramBoardColumn
                key={column.id}
                title={column.title}
                stories={stories}
                tasks={sprintTasks}
              />
            })}
          </SprintTable></div>)}
        </div>
      </details>
    )}
    </AppContext.Consumer>
  )
}

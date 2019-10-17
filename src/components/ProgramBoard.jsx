import React from 'react'
import styled from 'styled-components'
import AppContext from '../AppContext'
import ProgramBoardColumn from './ProgramBoardColumn'

const SprintTable = styled.div`
display: flex;
flex: 1;
justify-content: space-between;
`

export default ({ stories, tasks, sprints }) => {
  return (
    <AppContext.Consumer>{() => (
      <details open>
        <summary>Program board</summary>
        <div>
          {sprints && tasks && sprints.map(sprint => <div><h1>{sprint.teamName}</h1><SprintTable>{sprint.columnOrder.map((columnId) => {
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

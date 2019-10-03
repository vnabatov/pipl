import React from 'react'
import Column from './Column'
import { DragDropContext } from 'react-beautiful-dnd'
import use from 'react-hoox'
import styled from 'styled-components'
import AppContext from '../AppContext'

const SprintTable = styled.div`
display: flex;
flex: 1;
justify-content: space-between;
`

export default ({ sprintDb, setData, tasksDb }) => {
  use(sprintDb)
  use(tasksDb)

  const onDragEnd = ({ destination, source, draggableId }) => {
    if (!destination) {
      return
    }

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return
    }

    const columnStart = sprintDb.columns[source.droppableId]
    const columnFinish = sprintDb.columns[destination.droppableId]

    if (columnStart === columnFinish) {
      // same column
      const newTaskIds = Array.from(columnStart.taskIds)
      newTaskIds.splice(source.index, 1)
      newTaskIds.splice(destination.index, 0, draggableId)
      sprintDb.columns[columnStart.id].taskIds = newTaskIds
    } else {
      // different column
      const startTaskIds = Array.from(columnStart.taskIds)
      startTaskIds.splice(source.index, 1)

      const finishTaskIds = Array.from(columnFinish.taskIds)
      finishTaskIds.splice(destination.index, 0, draggableId)

      sprintDb.columns[columnStart.id].taskIds = startTaskIds
      sprintDb.columns[columnFinish.id].taskIds = finishTaskIds
    }

    sprintDb.dirty = true

    setData(sprintDb, sprintDb.teamName)
  }

  return (
    <AppContext.Consumer>{() => (
      <details open>
        <summary>{sprintDb.teamName}{sprintDb.dirty ? '🔄' : ''}</summary>
        <SprintTable>
          <DragDropContext onDragEnd={onDragEnd}>
            {
              sprintDb.columnOrder.map((columnId) => {
                const column = sprintDb.columns[columnId]
                const tasks = column.taskIds.map(taskId => tasksDb.filter(task => task.id === taskId)[0] || { id: taskId, summary: 'not found' })
                return <Column
                  dirty={sprintDb.dirty}
                  teamName={sprintDb.teamName}
                  key={column.id}
                  column={column}
                  title={column.title}
                  tasks={tasks} />
              })
            }
          </DragDropContext>
        </SprintTable>
      </details>
    )}
    </AppContext.Consumer>
  )
}

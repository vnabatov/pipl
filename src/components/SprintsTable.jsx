import React, { Fragment } from 'react'
import Column from './Column'
import { DragDropContext } from 'react-beautiful-dnd'
import use from 'react-hoox'
import styled from 'styled-components'

const TeamName = styled.h3`
width: 100%;
`
const SprintTable = styled.div`
display: flex;
flex: 1;
justify-content: space-between;
`

export default ({ database, setData }) => {
  use(database)

  // todo: create task button

  // todo: edit task (link to story, description, depends on)

  // todo: multiple teams

  // todo: select related task
  
  // todo: (independend) backup server (10 last backups every 5 mins)

  const onDragEnd = ({ destination, source, draggableId }) => {
    if (!destination) {
      return
    }

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return
    }

    const columnStart = database.columns[source.droppableId]
    const columnFinish = database.columns[destination.droppableId]

    if (columnStart === columnFinish) {
      // same column
      const newTaskIds = Array.from(columnStart.taskIds)
      newTaskIds.splice(source.index, 1)
      newTaskIds.splice(destination.index, 0, draggableId)
      database.columns[columnStart.id].taskIds = newTaskIds
    } else {
      // different column
      const startTaskIds = Array.from(columnStart.taskIds)
      startTaskIds.splice(source.index, 1)

      const finishTaskIds = Array.from(columnFinish.taskIds)
      finishTaskIds.splice(destination.index, 0, draggableId)

      database.columns[columnStart.id].taskIds = startTaskIds
      database.columns[columnFinish.id].taskIds = finishTaskIds
    }

    database.dirty = true
    setData(database)
  }

  return <Fragment>
    <TeamName>{database.teamName}{database.dirty ? '🔄' : ''}</TeamName>
    <SprintTable>
      <DragDropContext onDragEnd={onDragEnd}>
        {
          database.columnOrder.map((columnId) => {
            const column = database.columns[columnId]
            const tasks = column.taskIds.map(taskId => database.tasks[taskId])
            return <Column dirty={database.dirty} key={column.id} column={column} title={column.title} tasks={tasks} />
          })
        }
      </DragDropContext>
    </SprintTable>
  </Fragment>
}

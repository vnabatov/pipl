import React from 'react'
import Column from './Column'
import { DragDropContext } from 'react-beautiful-dnd'
import use from 'react-hoox'

export default ({ database, setData }) => {
  use(database)

  // todo: add task button

  // todo: edit task (link to story, description, depends on)

  // todo: indicate related task is after

  // todo: multiple teams

  // todo: related tasks

  // todo: backup server

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

    setData(database)
  }

  return <div>
    <div className='sprint-table'>
      <DragDropContext onDragEnd={onDragEnd}>
        {
          database.columnOrder.map((columnId) => {
            const column = database.columns[columnId]
            const tasks = column.taskIds.map(taskId => database.tasks[taskId])
            return <Column key={column.id} column={column} title={column.title} tasks={tasks} />
          })
        }
      </DragDropContext>
    </div>
  </div>
}

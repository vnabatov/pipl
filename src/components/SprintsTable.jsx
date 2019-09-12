import React from 'react'
import Ticket from './Ticket'
import Column from './Column'
import { DragDropContext } from 'react-beautiful-dnd'
import initialData from '../data/initial-data'
import use from 'react-hoox'

let state = initialData

export default ({ changeData }) => {
    use(state)

    const onDragEnd = ({destination, source, draggableId}) => {
        if(!destination) {
            return
        }

        if(
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
        return
        }

        const column = state.columns[source.droppableId]
        const newTaskIds = Array.from(column.taskIds)
        newTaskIds.splice(source.index, 1)
        newTaskIds.splice(destination.index, 0, draggableId)

        const newColoumn = {
            ...column, 
            taskIds: newTaskIds
        }

        state = { ...state, columns: {
            ...state.columns, 
            [newColoumn.id]: newColoumn
        }}

        console.log(state, newTaskIds)
    }

    return <div>
    <input type='range' onChange={changeData} />
    <div className="sprint-table">
    <DragDropContext  onDragEnd={onDragEnd}>
    {
        state.columnOrder.map((columnId)=>{
            const column = state.columns[columnId]
            const tasks = column.taskIds.map(taskId => state.tasks[taskId]);
            return <Column key={column.id} column={column} title={column.title} tasks={tasks} />;
        })
    }    
    </DragDropContext>
    </div>
</div>
}
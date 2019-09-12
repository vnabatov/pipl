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

        const columnStart = state.columns[source.droppableId]
        const columnFinish = state.columns[destination.droppableId]

        if(columnStart === columnFinish){
            const newTaskIds = Array.from(columnStart.taskIds)
            newTaskIds.splice(source.index, 1)
            newTaskIds.splice(destination.index, 0, draggableId)
    
            const newColoumn = {
                ...columnStart, 
                taskIds: newTaskIds
            }
    
            state = { ...state, columns: {
                ...state.columns, 
                [newColoumn.id]: newColoumn
            }}
            return

            console.log(state, newTaskIds)

        } 
        //different column

        const startTaskIds = Array.from(columnStart.taskIds)
        startTaskIds.splice(source.index, 1)
       
        const newColumnStart = {
            ...columnStart,
            taskIds: startTaskIds
        }

        const finishTaskIds = Array.from(columnFinish.taskIds)
        finishTaskIds.splice(destination.index, 0, draggableId)

        const newColumnFinish = {
            ...columnFinish,
            taskIds: finishTaskIds
        }

        state = { ...state, columns: {
            ...state.columns, 
            [newColumnStart.id]: newColumnStart,
            [newColumnFinish.id]: newColumnFinish
        }}
        return
        

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
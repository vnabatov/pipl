import React from 'react'
import styled from 'styled-components'
import Ticket from './Ticket'
import { Droppable } from 'react-beautiful-dnd'

const Container = styled.div`
margin:3px;
border: 1px solid lightgrey;
border-radius: 2px;
width: 100%;
overflow: hidden;
background: rgba(255,255,255,.8);
`
const Title = styled.div`
padding:3px;
font-size:1.2rem;
width: 100%;
text-align:center;
`
const TaskList = styled.div`
padding:3px;
min-width: 100px;
min-height: 100%;
`

export default ({ title, tasks, column, selectTask, deleteTask }) => {
  return <Container>
    <Title>{title} SP:{tasks.reduce((acc, val) => acc + parseInt(val.sp, 10), 0)}</Title>
    <Droppable droppableId={column.id}>
      {(provided) => <TaskList
        ref={provided.innerRef}
        {...provided.droppableProps}
      >
        {tasks.map((task, index) => <Ticket deleteTask={deleteTask} selectTask={selectTask} key={task.id} index={index} task={task} />)}
        {provided.placeholder}
      </TaskList>
      }
    </Droppable>
  </Container>
}

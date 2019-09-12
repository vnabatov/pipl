import React from 'react'
import styled from 'styled-components'
import Ticket from './Ticket'
import { Droppable } from 'react-beautiful-dnd'

const Container = styled.div`
margin:3px;
border: 1px solid lightgrey;
border-radius: 2px;
width: 100%;
`
const Title = styled.h3`
padding:3px;
`
const TaskList = styled.div`
padding:3px'
`

export default ({ title, tasks, column }) => {
  return <Container>
    <Title>{title}</Title>
    <Droppable droppableId={column.id}>
      {(provided) => <TaskList
        ref={provided.innerRef}
        {...provided.droppableProps}
      >
        {tasks.map((task, index) => <Ticket key={task.id} index={index} task={task} />)}
        {provided.placeholder}
      </TaskList>
      }
    </Droppable>
  </Container>
}

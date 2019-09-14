import React from 'react'
import styled from 'styled-components'
import { Draggable } from 'react-beautiful-dnd'

const Container = styled.div`
margin:3px;
padding:3px;
border: 1px solid lightgrey;
border-radius: 2px;
background-color: white;
`

export default ({ task, index }) => {
  return <Draggable draggableId={task.id} index={index}>{(provided) =>
    <Container
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      ref={provided.innerRef}
    >
      {task.content}
    </Container>
  }</Draggable>
}

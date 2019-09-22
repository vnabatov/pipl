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
const Grid = styled.div`
display: grid;
grid-template-rows: 1fr;
grid-template-columns: 1fr 2fr;
grid-row-gap: 3px;
`

const Label = styled.div`
padding: 3px;
text-align:right;
text-transform: capitalize;
padding-right: 10px;
`

const Del = styled.div`
padding: 3px;
text-align:right;
text-transform: capitalize;
padding-right: 10px;
&:hover {
  background-color: palevioletred;
  color: white;
}
`

export default ({ task, index, selectTask, deleteTask }) => {
  return <Draggable draggableId={task.id} index={index}>{(provided) =>
    <Container
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      ref={provided.innerRef}
    >
      <div onClick={() => selectTask(task.id ? task : { id: task })} >
        <Grid>
          <Label><strong>#{task.id}&nbsp;/&nbsp;{task.sp}SP</strong></Label>
          <Label>{task.summary}</Label>

          <Label>Story:[{task.story}]</Label>
          <Label>Rel:[{task.related}]</Label>

        </Grid>
      </div>
      <Del onClick={() => deleteTask(task.id)}>&times;</Del>
    </Container>
  }</Draggable>
}

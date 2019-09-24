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
grid-template-columns: 1fr 1fr;
grid-row-gap: 3px;
`

const Label = styled.div`
text-align:right;
word-break: break-word;
text-transform: capitalize;
`

export default ({ task, index, selectTask, deleteTask }) => {
  return <Draggable draggableId={task.id} index={index}>{(provided) =>
    <Container
      className={'task' + task.id}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      ref={provided.innerRef}
    >
      <div onClick={() => selectTask(task.id ? task : { id: task })} >
        <Label><strong>#{task.id}&nbsp;/&nbsp;{task.sp}SP</strong> <input className='button is-small' type='button' value='&times;' onClick={() => deleteTask(task.id)} /> </Label>

        <Label>{task.summary}</Label>

        <Grid>
          <Label>Story:[{task.story}]</Label>
          <Label>Rel:[{task.related}]</Label>
        </Grid>
      </div>
    </Container>

  }</Draggable>
}

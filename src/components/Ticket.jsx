import React from 'react'
import styled from 'styled-components'
import { Draggable } from 'react-beautiful-dnd'

const Container = styled.div`
padding:3px;
`

const Grid = styled.div`
display: grid;
grid-template-rows: 1fr;
grid-template-columns: 1fr 1fr;
grid-row-gap: 3px;
grid-column-gap: 3px;
`

const Label = styled.div`
text-align:center;
word-break: break-word;
text-transform: capitalize;
`

const Ticket = styled.div`
height: 100px;
border: 1px solid lightgray;
background: rgba(255,255,255, .7);
`
const TicketHeader = styled.div`
transition: all .2s;
align-items: center;
background-color: ${({ selected }) => selected ? '#3273dc' : '#23d160'};
border-radius: 4px 4px 0 0;
color: #fff;
display: -ms-flexbox;
display: flex;
font-weight: 700;
justify-content: space-between;
line-height: 1.25;
padding: 0.75em 1em;
position: relative;
`
const TicketBody = styled.div`
padding: 3px;
word-break: break-word;
`

export default ({ task, index, selectTask, deleteTask, selectedStory }) => {
  return <Draggable draggableId={task.id} index={index}>{(provided) =>
    <Container
      className={'task' + task.id}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      ref={provided.innerRef}
    >

      <Ticket onClick={() => selectTask(task.id ? task : { id: task })} className='message is-small'>
        <TicketHeader selected={selectedStory && selectedStory === task.story}>
          <p>#{task.id}&nbsp;/&nbsp;{task.sp}SP</p>
          <button className='delete is-small' aria-label='delete' onClick={() => deleteTask(task.id)} />
        </TicketHeader>
        <TicketBody>
          {task.summary}
          <Grid>
            <Label>Story:[{task.story}]</Label>
            <Label>Rel:[{task.related}]</Label>
          </Grid>
        </TicketBody>
      </Ticket>

    </Container>

  }</Draggable>
}

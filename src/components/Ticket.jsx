import React from 'react'
import styled from 'styled-components'
import { Draggable } from 'react-beautiful-dnd'
import AppContext from '../AppContext'

const Container = styled.div`
padding:3px;
`

const Grid = styled.div`
display: grid;
grid-template-rows: 1fr;
grid-template-columns: 1fr 1fr 1fr ;
grid-row-gap: 3px;
grid-column-gap: 3px;
justify-content: center;
  align-items: center;
`

const Label = styled.div`
text-align:center;
word-break: break-word;
text-transform: capitalize;
`

const Ticket = styled.div`
min-height: 100px;
border: 1px solid lightgray;
background: rgba(255,255,255, .7);
`
const TicketHeader = styled.div`
transition: all .2s;
align-items: center;
border-radius: 4px 4px 0 0;
${({ relationWarning, selected }) => {
    if (relationWarning) {
      if (selected) {
        return 'background-color: #AB23D1;'
      } else {
        return 'background-color: #D12341;'
      }
    } else {
      if (selected) {
        return 'background-color: #3273DC;'
      } else {
        return 'background-color: #23D160;'
      }
    }
  }
}
color: #fff;
display: -ms-flexbox;
display: flex;
font-weight: 700;
justify-content: space-between;
line-height: 1.25;
padding: 4px;
position: relative;
`
const TicketBody = styled.div`
padding: 3px;
word-break: break-word;
`

const areRelatedTaskPositionsForbidden = (taskPostionsCache, taskId, taskRelated) => {
  let errorFound = false

  if (!taskRelated) return false

  taskRelated.split(',').forEach(related => {
    if (taskPostionsCache[related] >= taskPostionsCache[taskId]) {
      errorFound = true
    }
  })
  return errorFound
}

export default ({ task, index }) => {
  return <AppContext.Consumer>{({ deleteTask, selectedStory, selectTask, selectStory, taskPostionsCache, dependendTasks }) => (
    <Draggable draggableId={task.id} index={index}>{(provided) => (
      <Container
        className={'task' + task.id}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        ref={provided.innerRef}
      >
        <Ticket onClick={() => selectTask(task.id ? task : { id: task })} className='message is-small'>
          <TicketHeader
            selected={selectedStory && selectedStory === task.story}
            relationWarning={areRelatedTaskPositionsForbidden(taskPostionsCache, task.id, task.related)}
          >
            <p>#{task.id}&nbsp;/&nbsp;{task.sp}SP</p>
            <button className='delete' aria-label='delete' onClick={() => deleteTask(task.id)} />
          </TicketHeader>
          <TicketBody>
            {task.summary}

            <Grid>
              <Label title='depends on'>{task.related}</Label>
              <Label title='story' onClick={() => selectStory(task.story)}>{task.story}</Label>
              <Label title='enables'>{dependendTasks[task.id] ? dependendTasks[task.id].join(',') : ''}</Label>
            </Grid>
          </TicketBody>
        </Ticket>
      </Container>
    )}
    </Draggable>
  )}
  </AppContext.Consumer>
}

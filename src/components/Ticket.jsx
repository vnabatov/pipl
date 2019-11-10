import React, { memo } from 'react'
import styled from 'styled-components'
import { Draggable } from 'react-beautiful-dnd'
import AppContext from '../AppContext'
import shallowequal from 'shallowequal'

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
${({ selected }) => selected ? 'font-weight: bold;' : ''}}

`

const Ticket = styled.div`
min-height: 100px;
background: rgba(255,255,255, .7);
`
const TicketHeader = styled.div`
transition: all .2s;
align-items: center;
border-radius: 4px 4px ${({ isSmall }) => isSmall ? '4px 4px' : '0 0'};

background-color: #23D160;

color: #fff;
display: -ms-flexbox;
display: flex;
font-weight: 700;
justify-content: space-between;
line-height: 1.25;
padding: 4px;
position: relative;
word-break: break-word;

${({ isSmall }) => isSmall ? 'font-size: 0.6rem;' : ''}}
${({ relationSameSprint }) => relationSameSprint ? `background-color: orange;` : ''}}
${({ relationEarlier }) => relationEarlier ? 'background-color: #D12341;' : ''}}
${({ relationBacklog }) => relationBacklog ? 'background-color: red;' : ''}}
${({ selectedTask }) => selectedTask ? 'border-left: 3px solid #3273DC;' : ''}}
${({ selectedStory }) => selectedStory ? 'border-top: 3px solid green;' : ''}}
${({ noStory }) => noStory ? 'border-right: 3px solid #AB23D1;' : ''}}
`

const TicketBody = styled.div`
padding: 3px;
word-break: break-word;
`
const Error = styled.div`
font-weight: bold;
color: red;
`

const areRelatedTaskPositionsEarlier = (taskPostionsCache, taskId, taskRelated) => {
  let errorFound = false

  if (!taskRelated) return false

  taskRelated.split(',').forEach(related => {
    if (taskPostionsCache[related] > taskPostionsCache[taskId]) {
      errorFound = true
    }
  })
  return errorFound
}

const areRelatedTaskPositionsSameSprint = (taskPostionsCache, taskId, taskRelated) => {
  let errorFound = false

  if (!taskRelated) return false

  taskRelated.split(',').forEach(related => {
    if (taskPostionsCache[related] === taskPostionsCache[taskId]) {
      errorFound = true
    }
  })
  return errorFound
}

const areRelatedTaskPositionsInBacklog = (taskPostionsCache, taskId, taskRelated) => {
  let errorFound = false

  if (!taskRelated) return false

  taskRelated.split(',').forEach(related => {
    if (taskPostionsCache[related] === 1) {
      errorFound = true
    }
  })
  return errorFound
}

const Task = memo(({
  selectedStory,
  task,
  selectedId,
  taskPostionsCache,
  isCompact,
  deleteTask,
  selectStory,
  dependendTasks,
  selectTask
}) => {
  const isSelectedTask = selectedStory && selectedStory === task.story
  const isSelectedStory = selectedId && selectedId === task.id
  const relationEarlier = areRelatedTaskPositionsEarlier(taskPostionsCache, task.id, task.related)
  const relationSameSprint = areRelatedTaskPositionsSameSprint(taskPostionsCache, task.id, task.related)
  const relationBacklog = areRelatedTaskPositionsInBacklog(taskPostionsCache, task.id, task.related)
  return !isCompact || isSelectedTask || isSelectedStory ? <Ticket key={'task-' + task.id} id={'task-' + task.id} title={JSON.stringify(task)} onClick={() => selectTask(task)} className='message is-small'>
    <TicketHeader
      selectedStory={isSelectedStory}
      selectedTask={isSelectedTask}
      noStory={!task.story}
      relationEarlier={relationEarlier}
      relationSameSprint={relationSameSprint}
      relationBacklog={relationBacklog}
    >
      <a target='_blank' href={`https://jira.wiley.com/browse/${task.id}`}>#{task.id}</a>&nbsp;/&nbsp;{task.sp}SP / ver:{task.v}
      <button className='delete is-small' aria-label='delete' onClick={() => deleteTask(task.id)} />
    </TicketHeader>
    <TicketBody title={task.description}>
      {task.summary}
      <Grid>
        <Label title='depends on'>{task.related}</Label>
        <Label selected={selectedStory && selectedStory === task.story} title='story' onClick={() => selectStory(task.story)}>{task.story}</Label>
        <Label title='enables'>{dependendTasks[task.id] ? dependendTasks[task.id].join(',') : ''}</Label>
      </Grid>
      <Error>
        {relationEarlier ? 'Enabler is in later sprint' : ''}
        {relationSameSprint ? 'Enabler is in the same sprint' : ''}
        {relationBacklog ? 'Enabler is in the backlog' : ''}
      </Error>
    </TicketBody>
  </Ticket> : <TicketHeader
    isSmall
    key={'task-' + task.id}
    onClick={() => selectTask(task)}
    selectedStory={isSelectedStory}
    selectedTask={isSelectedTask}
    title={task.summary + '/' + task.description}
    relationEarlier={relationEarlier}
    relationSameSprint={relationSameSprint}
    relationBacklog={relationBacklog}
  >
#{task.id} / {task.summary} / {task.sp}SP
    <button className='delete is-small' aria-label='delete' onClick={() => deleteTask(task.id)} />
  </TicketHeader>
}, (prevProps, nextProps) => shallowequal(prevProps.task, prevProps.task) &&
nextProps.task.id !== nextProps.selectedId &&
nextProps.task.id !== prevProps.selectedId &&
prevProps.task.story !== prevProps.selectedStory &&
nextProps.task.story !== nextProps.selectedStory &&
prevProps.isCompact === nextProps.isCompact
)

export default memo(({ task, index }) => {
  return <AppContext.Consumer>{({ deleteTask, selectedStory, selectTask, selectStory, taskPostionsCache, dependendTasks, isCompact, selectedId }) => {
    return (
      <Draggable draggableId={task.id} index={index}>{(provided) => (
        <Container
          className={'task' + task.id}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
        >
          <Task {...{
            selectedStory,
            task,
            selectedId,
            taskPostionsCache,
            isCompact,
            deleteTask,
            selectStory,
            dependendTasks,
            selectTask
          }} />
        </Container>
      )}
      </Draggable>
    )
  }}
  </AppContext.Consumer>
})

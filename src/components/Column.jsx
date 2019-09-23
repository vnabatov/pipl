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
background: ${({ error }) => error ? 'red' : 'none'}
`
const TaskList = styled.div`
padding:3px;
min-width: 100px;
min-height: 100%;
`

export default ({ title, tasks, column, selectTask, deleteTask, updateColumnCount, teamName }) => {
  const spSum = tasks.reduce((acc, val) => acc + parseInt(val.sp, 10), 0)
  const capacityError = column.size < spSum

  return <Container>
    <Title error={capacityError}>
      {title}
      <div class='field has-addons '>

        <p class='control'>
          <input className='input is-small' defaultValue={column.size} type='text' onChange={(e) => updateColumnCount(column.id, teamName, e.target.value)} />
        </p>
        <p class='control'>
          <a class='button is-small'>
            -
          </a>
        </p>
        <p class='control'>
          <a title='total sum of task sps' class='button is-small'>
            {spSum}
          </a>
        </p>
        <p class='control'>
          <a class='button is-small'>
            =
          </a>
        </p>
        <p class='control'>
          <a title='remaining' class='button is-small'>
            {column.size - spSum}
          </a>
        </p>
      </div>

    </Title>
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

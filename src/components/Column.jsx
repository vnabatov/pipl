import React, { memo } from 'react'
import styled from 'styled-components'
import Ticket from './Ticket'
import { Droppable } from 'react-beautiful-dnd'
import AppContext from '../AppContext'

const Container = styled.div`
margin:1px;
border: 1px solid lightgrey;
border-radius: 2px;
width: 100%;
overflow: hidden;
background: rgba(255,255,255,.8);
`
const Title = styled.div`
transition: all .2s;
padding:1px;
font-size:1.2rem;
width: 100%;
text-align:center;
background: ${({ error, fit }) => error ? 'lightcoral' : (fit ? 'lightgreen' : 'none')}
display: grid;
grid-template-columns: 1fr 1fr 1fr;
`
const TaskList = styled.div`
min-width: 100px;
min-height: 100%;
`
const HeaderItem = styled.div`
  align-self: center;
  font-size: 12px;
  justify-self: center;
`
const HeaderA = styled.div`
   text-align:'center';
   alignSelf: 'center'; 
   font-size: 12px;
   justify-self: 'center'; 
`


const TaskInnerList = ({ provided, tasks, taskLastUpdate }) =>
  (
    <TaskList
      ref={provided.innerRef}
      {...provided.droppableProps}
    >
      {tasks.map((task, index) => task.summary !== 'not found' ? <Ticket
        taskLastUpdate={taskLastUpdate ? taskLastUpdate[task.id] : 0}
        key={task.id}
        index={index}
        task={task}
      /> : '')}
      {provided.placeholder}
    </TaskList>
  )

export default memo(({ title, tasks, column, teamName }) => {
  const spSum = tasks.reduce((acc, val) => acc + parseFloat(val.sp), 0)
  return <AppContext.Consumer>{({ updateColumnCount, taskLastUpdate }) => (<Container>
    <Title error={parseFloat(parseFloat(column.size).toFixed(2)) < parseFloat(spSum.toFixed(2))} fit={parseFloat(column.size).toFixed(2) === spSum.toFixed(2)}>
      <HeaderItem>{title}</HeaderItem>
      <input title='capacity' style={{width: 30, border: '1px solid gray', textAlign:'center', alignSelf: 'center', justifySelf: 'center', borderRadius:50}} defaultValue={column.size} type='text' onChange={(e) => updateColumnCount(column.id, teamName, e.target.value)} />
      <HeaderA>
        - {spSum} =&nbsp;<strong> {column.size - spSum}</strong>
      </HeaderA>
    </Title>
    <Droppable droppableId={column.id}>
      {(provided) => <TaskInnerList {...{ provided, tasks, taskLastUpdate }} />}
    </Droppable>
  </Container>)}</AppContext.Consumer>
})

import React from 'react'
import styled from 'styled-components'
import AppContext from '../AppContext'

const Story = styled.div`
transition: .2s all;
max-height: 50px;
border: 1px solid lightgray;
overflow: hidden;
margin: 0 !important;
background-color: ${({ selected }) => selected ? 'rgba(50, 115, 220, .7)' : 'none'} !important;
`

const Container = styled.div`
margin:3px;
border: 1px solid lightgrey;
border-radius: 2px;
width: 100%;
overflow: hidden;
background: rgba(255,255,255,.8);
`
const Title = styled.div`
transition: all .2s;
padding:3px;
font-size:1.2rem;
width: 100%;
text-align:center;
background: ${({ error, fit }) => error ? 'lightcoral' : (fit ? 'lightgreen' : 'none')}
opacity: .7;
z-index: 2;
`
const TaskList = styled.div`
padding:3px;
min-width: 100px;
`

export default ({ tasks, title, stories }) => (
  <AppContext.Consumer>
    {({ selectStory, selectedStory }) => (
      <Container><Title>{title}</Title><TaskList>
        {tasks.map(({ story, id, summary }, index) => {
          return <Story selected={selectedStory === story} onClick={() => selectStory(story)}key={index} className={`message is-small story${id}`}>
            <a href={`https://jira.wiley.com/browse/${story}`}>#{id}</a> {summary}
          </Story>
        })}
      </TaskList></Container>)}
  </AppContext.Consumer>
)

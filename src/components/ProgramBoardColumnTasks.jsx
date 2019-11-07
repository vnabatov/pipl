import React from 'react'
import styled from 'styled-components'
import AppContext from '../AppContext'

const Story = styled.div`
transition: .2s all;
padding: 4px;
max-height: 70px;
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
const TaskLink = styled.a`
text-decoration: none !important;
font-size:14px;
`

export default ({ tasks, title }) => (
  <AppContext.Consumer>
    {({ selectStory, selectedStory, isCompact }) => (
      <Container><Title>{title}</Title><TaskList>
        {tasks.map(({ story, id, summary }) => {
          return isCompact ? <Story key={'compact-pb-task-' + id} hide={isCompact && selectedStory !== story} selected={selectedStory === story} onClick={() => selectStory(story)} className={`message is-small story${id}`}>
            <TaskLink tilte={'task ' + summary} href={`https://jira.wiley.com/browse/${story}`}>{id}</TaskLink>
          </Story> : <Story id={'pb-task-' + id} selected={selectedStory === story} onClick={() => selectStory(story)} key={'pb-task-' + id} className={`message is-small story${id}`}>
            <TaskLink href={`https://jira.wiley.com/browse/${story}`}>T&nbsp;/&nbsp;{id}&nbsp;({story || ' NO STORY '})</TaskLink><div>{summary}</div>
          </Story>
        })}
      </TaskList></Container>)}
  </AppContext.Consumer>
)

import React from 'react'
import styled from 'styled-components'
import AppContext from '../AppContext'

const Story = styled.div`
transition: .2s all;
max-height: 70px;
padding: 4px;
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
font-size:16px;
`

export default ({ title, sprintStories }) => (
  <AppContext.Consumer>
    {({ selectStory, selectedStory }) => (
      <Container><Title>{title}</Title><TaskList>
        {sprintStories.map((story) => {
          return story ? <Story selected={selectedStory === story.id} key={'pb-story' + story.id} onClick={() => selectStory(story.id)} className={`message is-small story${story.id}`}>
            <TaskLink title='story' href={`https://jira.wiley.com/browse/${story.id}`}>{story.id}</TaskLink>{story.summary}
          </Story> : ''
        })}
      </TaskList></Container>)}
  </AppContext.Consumer>
)

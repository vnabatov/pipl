import React from 'react'
import styled from 'styled-components'
import AppContext from '../AppContext'

const Container = styled.div`
margin:3px;
width: 100%;
overflow: hidden;
background: rgba(255,255,255,.8);
`
const Row = styled.div`
display: flex;
flex-direction: colummn;
`
const TaskList = styled.div`
padding:3px;
min-width: 100px;
`
const StoryLine = styled.div`
padding:3px;
margin-left:  ${({ startSprint }) => (startSprint) * 100 / 6 + '%'}
margin-bottom: 1px
width: ${({ startSprint, endSprint }) => (endSprint - startSprint + 1) * 100 / 6 + '%'}
background:  ${({ startSprint }) => startSprint === 0 ? 'red' : '#3273DC'}
color: white;
border-radius: 3px;
overflow: hidden;
font-size: 10px;
`

export default ({ storySprintIndex, storyIndex, taskFilter }) => (
  <AppContext.Consumer>
    {({ selectStory, selectedStory }) => {
      return (
        <Container>
          <TaskList>
            {storySprintIndex && Object.entries(storySprintIndex).map(([storyId, value]) => {
              if (
                (
                  !selectedStory ||
                 selectedStory === storyId
                ) &&
              (
                taskFilter === '' ||
                storyId.includes(taskFilter)) ||
                (storyIndex[storyId] && storyIndex[storyId].summary.includes(taskFilter))
              ) {
                const summary = (storyIndex[storyId] && storyIndex[storyId].summary) || ''

                return (<Row>
                  <StoryLine onClick={() => selectStory(storyId)} startSprint={value[0] - 1} endSprint={value[1] - 1}>{storyId} ({value[0] - 1}-{value[1] - 1}) {summary}</StoryLine>
                </Row>)
              } else {
                return ''
              }
            })}
          </TaskList>
        </Container>
      )
    }}
  </AppContext.Consumer>

)

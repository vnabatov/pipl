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
const Sprint = styled.div`
width: ${100 / 6 + '%'};
display: inline-block;
text-align: center;
`
export default ({ BUFilter, sprints, storySprintIndex, storyIndex, taskFilter }) => (
  <AppContext.Consumer>
    {({ selectStory, selectedStory }) => {
      return (<div>
        <Container>
          {sprints && Object.entries(sprints[0].columns).map(([name, value]) => <Sprint>{value.title}</Sprint>)}
        </Container>
        <Container>
          <TaskList>
            {storySprintIndex && Object.entries(storySprintIndex).map(([storyId, value]) => {
              const summary = (storyIndex[storyId] && storyIndex[storyId].summary) || ''
              const bu = storyIndex[storyId] && storyIndex[storyId].bu

              let show = !selectedStory && !taskFilter

              if (selectedStory) {
                show = (selectedStory === storyId || storyIndex[selectedStory].relatedIssues.includes(storyId))
              }
              if (taskFilter) {
                show = (storyId.includes(taskFilter) || summary.includes(taskFilter))
              }
              if (BUFilter !== 'All' && BUFilter !== 'Empty') {
                show = bu === BUFilter
              }
              if (BUFilter === 'Empty') {
                show = !bu
              }
              if (show) {
                return (<Row>
                  <StoryLine id={`pbs-${storyId}`} className={`pbs-${storyId}`} onClick={() => selectStory(storyId)} startSprint={value[0] - 1} endSprint={value[1] - 1}>{storyId} ({value[0] - 1}-{value[1] - 1}) {summary}</StoryLine>
                </Row>)
              } else {
                return ''
              }
            })}
          </TaskList>
        </Container>
      </div>)
    }}
  </AppContext.Consumer>

)

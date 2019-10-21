import React from 'react'
import styled from 'styled-components'
import AppContext from '../AppContext'

const Container = styled.div`
display: grid;
grid-template-rows: 1fr;
grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
grid-row-gap: 3px;
grid-column-gap: 3px;
`
const Story = styled.div`
height: 50px;
border: 1px solid lightgray;
background: rgba(255,255,255, .7);
overflow: hidden;
margin: 0 !important;
border-radius: 4px;
${({ noTasks }) => noTasks ? 'border: 2px solid red !important;' : ''};
`
const StoryHeader = styled.div`
align-items: center;
background-color: ${({ selected }) => selected ? '#3273dc' : '#662C91'};
border-radius: 4px 4px 0 0;
color: #fff;
display: -ms-flexbox;
display: flex;
font-weight: 700;
justify-content: space-between;
line-height: 1.25;
padding: 4px;
position: relative;
`
const StoryBody = styled.div`
padding: 6px;
`
const getTaskCountForStory = (tasks, story) => tasks.filter(task => task.story === story).length

export default ({ stories, tasks }) => {
  return <AppContext.Consumer>{({ selectedStory, selectStory }) => (<details>
    <summary>Stories</summary>
    <Container>
      {stories.length && stories.map(({ id, summary }) => {
        const taskCount = getTaskCountForStory(tasks, id)

        return <Story noTasks={taskCount === 0} title={summary} onClick={() => selectStory(id)} className='message is-small'>
          <StoryHeader selected={id === selectedStory}>
            <a href={`https://jira.wiley.com/browse/${id}`}>#{id} {taskCount ? `(${taskCount})` : ''}</a>
          </StoryHeader>
          <StoryBody>
            {summary}
          </StoryBody>
        </Story>
      })}
    </Container>
  </details>)}
  </AppContext.Consumer>
}

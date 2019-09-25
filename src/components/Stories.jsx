import React from 'react'
import styled from 'styled-components'

const Container = styled.div`
display: flex;
flex: 1;
flex-direction: row;
justify-content: left;
`
const Story = styled.div`
margin-right: 10px;
height: 100px;
border: 1px solid lightgray;
background: rgba(255,255,255, .7);
`
const StoryHeader = styled.div`
align-items: center;
background-color: #3273dc;
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

export default ({ stories, selectStory }) => {
  return <div>
    <h3>Stories</h3>
    <Container>
      {stories.length && stories.map(({ id, summary }) => <Story onClick={() => selectStory(id)} className='message is-small'>
        <StoryHeader>
          <p>#{id} </p>
        </StoryHeader>
        <StoryBody>
          {summary}
        </StoryBody>
      </Story>)}
    </Container></div>
}

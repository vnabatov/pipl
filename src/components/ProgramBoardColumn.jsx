import React from 'react'
import styled from 'styled-components'

const Story = styled.div`
max-height: 50px;
border: 1px solid lightgray;
background: rgba(255,255,255, .7);
overflow: hidden;
margin: 0 !important;
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
`
const TaskList = styled.div`
padding:3px;
min-width: 100px;
`

export default ({ tasks, title, stories }) => {
  return <Container><Title>{title}</Title><TaskList>
    {tasks.map(({ story }, index) =>
      story && <Story key={index} className='message is-small'>
        <a href={`https://jira.wiley.com/browse/${story}`}>#{story}</a>  {stories.find(s => s.id === story).summary}
      </Story>
    )}
  </TaskList></Container>
}

import React, { useState } from 'react'
import styled from 'styled-components'
import AppContext from '../AppContext'
import ProgramBoardColumnTasks from './ProgramBoardColumnTasks'
import ProgramBoardColumnStories from './ProgramBoardColumnStories'
import { UnmountClosed } from 'react-collapse'
import PanelName from './PanelName'

const SprintTable = styled.div`
display: flex;
flex: 1;
justify-content: space-between;
`
const TeamName = styled.div`
min-width:150px
`

export default ({ stories, sprints, taskStoryIndex, storyIndex }) => {
  const [isOpened, setOpened] = useState(true)

  const storyColumns = {}
  Object.entries(sprints[0].columns).forEach(([id, value]) => (storyColumns[id] = { ...value, taskIds: [] }))
  const storySprint = {
    'id': '0',
    'teamName': 'Stories',
    'columns': storyColumns,
    'columnOrder': sprints[0].columnOrder.slice(1)
  }
  console.log(sprints)
  sprints.forEach(sprint => {
    const alreadyAdded = []
    Object.entries(sprint.columns).reverse().forEach(([columnId, { taskIds }]) => {
      taskIds.forEach(task => {
        const storyId = taskStoryIndex[task]
        if (storySprint.columns[columnId] && storyId && !storySprint.columns[columnId].taskIds.includes(storyId) && !alreadyAdded.includes(storyId)) {
          storySprint.columns[columnId].taskIds.push(storyId)
          alreadyAdded.push(storyId)
        }
      })
    })
  })

  return (
    <AppContext.Consumer>{() => (
      <div>
        <PanelName isOpened={isOpened} onClick={() => setOpened(!isOpened)}>Version board</PanelName>
        <UnmountClosed isOpened={isOpened}>
          <SprintTable key={'pb-sprint-stories'}>
            <TeamName>Stories</TeamName>
            {storySprint.columnOrder.map((columnId) => {
              const column = storySprint.columns[columnId]
              if (column) {
                const sprintStories = column.taskIds.map(storyId => storyIndex[storyId])
                return <ProgramBoardColumnStories
                  key={columnId}
                  title={column.title}
                  stories={stories}
                  sprintStories={sprintStories || {}}
                />
              } else {
                return ''
              }
            })}
          </SprintTable>
        </UnmountClosed>
      </div>
    )}
    </AppContext.Consumer>
  )
}

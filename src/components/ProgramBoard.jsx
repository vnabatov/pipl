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

export default ({ stories, tasks, sprints, taskStoryIndex, storyIndex }) => {
  const [isOpened, setOpened] = useState(true)

  const storyColumns = {}
  Object.entries(sprints[0].columns).forEach(([id, value]) => (storyColumns[id] = { ...value, taskIds: [] }))
  const storySprint = {
    'id': '0',
    'teamName': 'Stories',
    'columns': storyColumns,
    'columnOrder': sprints[0].columnOrder.slice(1)
  }

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
        <PanelName isOpened={isOpened} onClick={() => setOpened(!isOpened)}>Program board</PanelName>
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

          {sprints && tasks && sprints.map(sprint => <SprintTable key={'pb-sprint' + sprint.teamName}><TeamName>{sprint.teamName}</TeamName>
            {sprint.columnOrder.slice(1).map((columnId) => {
              if (storySprint.columns[columnId]) {
                const column = sprint.columns[columnId]
                const sprintTasks = column.taskIds.map(taskId => tasks.filter(task => task.id === taskId)[0] || { id: taskId, summary: 'not found' })
                return <ProgramBoardColumnTasks
                  key={column.id}
                  title={column.title}
                  stories={stories}
                  tasks={sprintTasks}
                />
              } else {
                return ''
              }
            })}
          </SprintTable>)}
        </UnmountClosed>
      </div>
    )}
    </AppContext.Consumer>
  )
}

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
export default ({ taskFilter, stories, tasks, sprints, taskStoryIndex, storyIndex }) => {
  const [isOpened, setOpened] = useState(true)
  const added = []
  const storySprintIndex = {}

  const storyColumns = {}
  Object.entries(sprints[0].columns).forEach(([id, value]) => (storyColumns[id] = { ...value, taskIds: [] }))
  const storySprint = {
    'id': '0',
    'teamName': 'Stories',
    'columns': storyColumns,
    'columnOrder': sprints[0].columnOrder.slice(1)
  }

  sprints.forEach(sprint => {
    Object.entries(sprint.columns).forEach(([columnId, { taskIds }]) => {
      taskIds.forEach(task => {
        const storyId = taskStoryIndex[task]
        if (
          storySprint.columns[columnId] &&
          storyId &&
          !storySprint.columns[columnId].taskIds.includes(storyId)
          //! alreadyAdded.includes(storyId) &&
        ) {
          storySprint.columns[columnId].taskIds.push(storyId)
          added.push(storyId)
          if (!storySprintIndex[storyId] || !storySprintIndex[storyId].length) {
            storySprintIndex[storyId] = []
          }
          storySprintIndex[storyId].push(parseInt(columnId.replace('column-', ''), 10))
        }
      })
    })
  })

  Object.entries(storySprintIndex).forEach(([index, value]) => {
    storySprintIndex[index] = [Math.min(...value), Math.max(...value)]
  })

  return (
    <AppContext.Consumer>{() => (
      <div>
        <PanelName isOpened={isOpened} onClick={() => setOpened(!isOpened)}>Program board</PanelName>
        <UnmountClosed isOpened={isOpened}>
          <ProgramBoardColumnStories storyIndex={storyIndex} taskFilter={taskFilter} storySprintIndex={storySprintIndex} />

          {sprints && tasks && sprints.map(sprint => <SprintTable key={'pb-sprint' + sprint.teamName}>
            {sprint.columnOrder.map((columnId) => {
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

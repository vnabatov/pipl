import React from 'react'
import styled from 'styled-components'
import AppContext from '../AppContext'
import ReactSelect from 'react-select'

const Container = styled.div`
display: grid;
grid-template-rows: 1fr;
grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
grid-row-gap: 3px;
grid-column-gap: 3px;
overflow-y: scroll;
max-height: 400px;
`
const Story = styled.div`
height: 100px;
border: 1px solid lightgray;
background: rgba(255,255,255, .7);
overflow: hidden;
margin: 0 !important;
border-radius: 4px;
`
const StoryHeader = styled.div`
align-items: center;
color: #fff;

${({ noTasks, selected }) => {
    if (noTasks) {
      if (selected) {
        return 'background-color: #AB23D1;'
      } else {
        return 'background-color: whitesmoke; color: #000 !important;'
      }
    } else {
      if (selected) {
        return 'background-color: #3273DC;'
      } else {
        return 'background-color: darkgreen;'
      }
    }
  }
}
border-radius: 4px 4px 0 0;
color: #fff;
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
const StoryFilters = styled.div`
margin-bottom: 10px;
justify-content: space-between;
display: grid;
grid-template-columns: 2fr 2fr 2fr 1fr;
grid-column-gap: 3px;
`

const getTaskCountForStory = (tasks, story) => tasks.filter(task => task.story === story).length

export default ({ stories, tasks, storiesFilter }) => {
  const updateForm = (field, value) => (storiesFilter[field] = value)

  let epicsSelectItems = {}
  stories.forEach(({ epicId }) => (epicsSelectItems[epicId] = 1))
  epicsSelectItems = Object.keys(epicsSelectItems).map(epic => epic === 'null' ? ({ value: '', label: 'All Epics' }) : ({ value: epic, label: epic }))

  let storiesSelectItems = stories.map(({ id, summary, epicId }) => ({ value: id, label: `${id} / ${epicId} / ${summary}` }))
  storiesSelectItems.unshift({ value: '', label: 'All Stories' })
  return <AppContext.Consumer>{({ selectedStory, selectStory }) => (<details open>
    <summary>Stories</summary>
    <StoryFilters>
      <ReactSelect
        key='epics'
        options={epicsSelectItems}
        value={{ value: storiesFilter.epicId, label: storiesFilter.epicId || 'All Epics' }}
        onChange={selectedOption => updateForm('epicId', selectedOption.value)}
      />
      <ReactSelect
        key='stories'
        options={storiesSelectItems}
        value={{
          value: storiesFilter.search && storiesFilter.search.value,
          label: (storiesFilter.search && storiesFilter.search.label) || 'All Stories'
        }}
        onChange={selectedOption => updateForm('search', selectedOption)}
      />
      <ReactSelect
        key='withTasks'
        options={[{ value: '', label: 'All' }, { value: 'withTasks', label: 'With Tasks' }, { value: 'withoutTasks', label: 'Without Tasks' }]}
        value={{ value: storiesFilter.withTasks, label: storiesFilter.withTasks || 'All' }}
        onChange={selectedOption => updateForm('withTasks', selectedOption.value)}
      />
      <div className='button is-small' type='button' onClick={() => {
        updateForm('epicId', null)
        updateForm('search', null)
        updateForm('withTasks', null)
      }}>Clear</div>
    </StoryFilters>
    <Container>
      {stories.length && stories.map(({ id, summary, epicId }) => {
        const taskCount = getTaskCountForStory(tasks, id)
        return (
          (!storiesFilter.epicId || storiesFilter.epicId === epicId) &&
          (!storiesFilter.search || !storiesFilter.search.value || storiesFilter.search.value === id) &&
          (!storiesFilter.withTasks || (storiesFilter.withTasks === 'withTasks' && taskCount > 0) || (storiesFilter.withTasks === 'withoutTasks' && taskCount === 0))
        )
          ? <Story title={summary} onClick={() => selectStory(id)} className='message is-small'>
            <StoryHeader noTasks={taskCount === 0} selected={id === selectedStory}>
              <a href={`https://jira.wiley.com/browse/${id}`}>#{id} {taskCount ? `(${taskCount})` : ''}</a> [{epicId}]
            </StoryHeader>
            <StoryBody>
              {summary}
            </StoryBody>
          </Story>
          : ''
      })}
    </Container>
  </details>)}
  </AppContext.Consumer>
}

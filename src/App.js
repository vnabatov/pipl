import React, { useEffect } from 'react'
import axios from 'axios'
import use from 'react-hoox'
import LineTo from 'react-lineto'
import 'bulma/css/bulma.css'
import './App.css'

import SprintsTable from './components/SprintsTable'
import TaskForm from './components/TaskForm'
import Stories from './components/Stories'

const api = { db: '/db', tasks: '/tasks', sprints: '/sprints', columns: '/columns' }
const defaultForm = { id: '', teamName: 'Already Done', summary: '', related: '', sp: '', story: '' }

let form = { ...defaultForm }
let selectedStory = ''
let dbs

const App = () => {
  use(() => form)
  use(() => selectedStory)
  use(() => dbs)

  const fetchData = () => {
    axios.get(api.db).then(({ data }) => {
      data.sprints.forEach(sprint => {
        sprint.dirty = false
      })
      dbs = data
    })
  }

  const setData = (data) => {
    axios.patch(api.sprints, data)
  }

  const selectTask = (taskData) => {
    form = taskData
  }

  const clearForm = () => {
    form = defaultForm
  }

  const updateTask = () => {
    axios.post(api.tasks, form)
    clearForm()
  }

  const deleteTask = (id) => {
    // eslint-disable-next-line no-undef
    if (window.confirm('sure?')) {
      axios.delete(api.tasks + '/' + (id || form.id))
      clearForm()
    }
  }

  const updateColumnCount = (columnId, teamName, size) => {
    axios.patch(api.columns + '/' + columnId, { teamName, size })
  }

  const showRelationForTask = (link, task, color = 'red') => {
    const style = {
      delay: true,
      borderColor: color,
      borderStyle: 'solid',
      borderWidth: 2
    }
    return task !== link
      ? <LineTo fromAnchor='center' toAnchor='center' {...style} from={`task${link}`} to={`task${task}`} />
      : ''
  }

  const renderLines = () => {
    const isBlockedBy = []
    const blocks = []
    return dbs && dbs.tasks.map(task => {
      if (task.related) {
        const isSelected = form.id === 'all' || form.id === task.id
        const hasRelationsToSelected = !isSelected && task.related.split(',').includes(form.id)
        if (isSelected) {
          isBlockedBy.push(task.related.split(',').map((link) => showRelationForTask(link, task.id, 'red')))
        }
        if (hasRelationsToSelected) {
          blocks.push(task.related.split(',').map((link) => link === form.id ? showRelationForTask(link, task.id, 'green') : ''))
        }
        if (hasRelationsToSelected) {
          blocks.push(task.related.split(',').map((link) => link !== form.id ? showRelationForTask(link, task.id, 'gray') : ''))
        }
        return [...isBlockedBy, ...blocks]
      } else {
        return ''
      }
    })
  }

  useEffect(() => {
    fetchData()
    setInterval(() => fetchData(), 3000)
  }, [])

  if (!dbs) return 'Loading'

  return <div className='container is-widescreen'>
    <TaskForm
      form={form}
      relatedTasks1={form.related}
      teamNames={dbs ? dbs.sprints.map(sprint => ({ value: sprint.teamName, name: sprint.teamName })) : []}
      stories={dbs ? dbs.stories.map(story => ({ value: story.id, name: story.summary })) : []}
      tasks={dbs ? dbs.tasks.map(task => ({ value: task.id, name: `#${task.id}: ${task.summary}` })) : []}
      updateTask={updateTask}
      deleteTask={deleteTask}
      clearForm={clearForm}
    />

    <h3>Stories</h3>
    <Stories selectStory={story => (selectedStory = (selectedStory !== story ? story : ''))} stories={dbs.stories} />

    {dbs.sprints.map((sprint, key) => <div className='App'>
      <SprintsTable
        selectedStory={selectedStory}
        updateColumnCount={updateColumnCount}
        tasksDb={dbs.tasks}
        sprintDb={sprint}
        setData={setData}
        key={key}
        deleteTask={deleteTask}
        selectTask={selectTask}
      />
    </div>)}

    {renderLines()}
  </div>
}
export default App

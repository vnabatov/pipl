import React, { useEffect } from 'react'
import axios from 'axios'
import use from 'react-hoox'

import Sprints from './components/Sprints'
import TaskForm from './components/TaskForm'
import Stories from './components/Stories'
import AppContext from './AppContext'
import Relations from './components/Relations'

import 'bulma/css/bulma.css'
import './App.css'

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

  useEffect(() => {
    fetchData()
    setInterval(() => fetchData(), 3000)
  }, [])

  if (!dbs) return 'Loading'

  return <div className='container is-widescreen'>
    <AppContext.Provider value={{ deleteTask, updateTask, selectedStory, updateColumnCount, setData, selectTask, clearForm }}>
      <TaskForm
        form={form}
        teamNames={dbs ? dbs.sprints.map(sprint => ({ value: sprint.teamName, name: sprint.teamName })) : []}
        stories={dbs ? dbs.stories.map(story => ({ value: story.id, name: story.summary })) : []}
        tasks={dbs ? dbs.tasks.map(task => ({ value: task.id, name: `#${task.id}: ${task.summary}` })) : []}
      />

      <Stories
        selectStory={story => (selectedStory = (selectedStory !== story ? story : ''))}
        stories={dbs.stories}
      />

      <Sprints setData={setData} tasks={dbs.tasks} sprints={dbs.sprints} />

      <Relations tasks={dbs.tasks} selectedId={form.id} />
    </AppContext.Provider>
  </div>
}
export default App

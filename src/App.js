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
let isMenuOpen = false
let isCompact = false
let selectedStory = ''
let dbs

const App = () => {
  use(() => form)
  use(() => isMenuOpen)
  use(() => isCompact)
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
    isMenuOpen = true
    form = taskData
  }

  const clearForm = () => {
    form = { ...defaultForm }
    isMenuOpen = false
  }

  const updateTask = () => {
    axios.post(api.tasks, form)
    clearForm()
  }

  const deleteTask = (id) => {
    const taskToRemoveId = id || form.id
    if (dbs.dependendTasks[taskToRemoveId] && dbs.dependendTasks[taskToRemoveId].length) {
    // eslint-disable-next-line no-undef
      alert(`please clear relations with ${dbs.dependendTasks[taskToRemoveId]}`)
      return
    }
    // eslint-disable-next-line no-undef
    if (confirm('sure?')) {
      axios.delete(`${api.tasks}/${taskToRemoveId}`)
      clearForm()
    }
  }

  const updateColumnCount = (columnId, teamName, size) => {
    axios.patch(api.columns + '/' + columnId, { teamName, size })
  }

  const selectStory = story => (selectedStory = (selectedStory !== story ? story : ''))

  useEffect(() => {
    fetchData()
    setInterval(() => fetchData(), 500)
  }, [])

  if (!dbs) return 'Loading'

  return <div className='container is-widescreen'>
    <AppContext.Provider value={{
      selectStory,
      deleteTask,
      updateTask,
      updateColumnCount,
      setData,
      selectTask,
      clearForm,
      selectedStory,
      dependendTasks: dbs.dependendTasks,
      taskPostionsCache: dbs.taskPostionsCache,
      isCompact
    }}>

      <nav className='navbar'>
        <div className='navbar-start'>
          <h1>PI Planning Helper</h1>
        </div>
        <div className='navbar-end'>

          <div className='navbar-item'>
            <div className={`button navbar-link is-arrowless ${isCompact ? 'is-success' : ''}`} onClick={() => (isCompact = !isCompact)}>
              Compact
            </div>
          </div>

          <div className='navbar-item'>
            <div className={`button navbar-link is-arrowless ${form.id === 'all' ? 'is-success' : ''}`} onClick={() => (form.id = (form.id === 'all' ? '' : 'all'))}>
              Relations
            </div>
          </div>

          <div className={`navbar-item has-dropdown ${isMenuOpen ? 'is-active' : ''}`}>

            <div className='navbar-link' onClick={() => (isMenuOpen = !isMenuOpen)}>
              Create/Edit
            </div>

            <div className='navbar-dropdown is-right'>
              <TaskForm
                form={form}
                teamNames={dbs ? dbs.sprints.map(sprint => ({ value: sprint.teamName, label: sprint.teamName })) : []}
                stories={dbs ? dbs.stories.map(({ id, summary }) => ({ value: id, label: `#${id}: ${summary}` })) : []}
                tasks={dbs ? dbs.tasks.map(({ id, summary }) => ({ value: id, label: `#${id}: ${summary}` })) : []}
              />
            </div>
          </div>
        </div>
      </nav>

      <div className='content'>
        <Stories
          stories={dbs.stories}
        />

        <Sprints setData={setData} tasks={dbs.tasks} sprints={dbs.sprints} />

        <Relations tasks={dbs.tasks} selectedId={form.id} />
      </div>
    </AppContext.Provider>
  </div>
}
export default App

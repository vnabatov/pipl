import React, { useEffect } from 'react'
import axios from 'axios'
import use from 'react-hoox'
import { format } from 'date-fns'

import Sprints from './components/Sprints'
import TaskForm from './components/TaskForm'
import Stories from './components/Stories'
import AppContext from './AppContext'
import Relations from './components/Relations'
import RelationsProgramBoard from './components/RelationsProgramBoard'

import 'bulma/css/bulma.css'
import './App.css'
import ProgramBoard from './components/ProgramBoard'

const api = { db: '/db', tasks: '/tasks', sprints: '/sprints', columns: '/columns' }
const defaultForm = { id: '', description: 'empty', teamName: '', summary: '', related: '', sp: '', story: '' }

let form = { ...defaultForm }
let isMenuOpen = false
let isCompact = false
let selectedStory = ''
let dbs
let storiesFilter = {}

const App = () => {
  use(() => isMenuOpen)
  use(() => isCompact)
  use(() => selectedStory)
  use(() => dbs)
  use(() => storiesFilter)

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

  const updateTask = ({ id, description, related, sp, story, summary, teamName }) => {
    axios.post(api.tasks, { id, description, related, sp, story, summary, teamName })
    clearForm()
  }

  const deleteTask = (id) => {
    const taskToRemoveId = id
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

  const downloadDb = () => {
    function downloadURI (uri, name) {
      var link = document.createElement('a')
      link.download = name
      link.href = uri
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
    downloadURI('db', format(new Date(), 'yyyy-MM-dd_HH_mm_ss') + '-db.json')
  }

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
      dependendTasks: dbs && dbs.dependendTasks,
      taskPostionsCache: dbs && dbs.taskPostionsCache,
      isCompact
    }}>

      <nav className='navbar'>
        <div className='navbar-start'>
          <h1>PI Planning Helper</h1>
        </div>
        <div className='navbar-end'>

          <div className='navbar-item'>
            <div className={`button navbar-link is-arrowless`} onClick={downloadDb}>
              Download
            </div>
          </div>

          <form
            action='/upload'
            style={{ display: 'inherit' }}
            method='post'
            encType='multipart/form-data'>

            <div className='navbar-item'>
              <div>
                <div className='file'>
                  <label className='file-label'>
                    <input className='file-input' type='file'name='dbFile' />
                    <span className='file-cta'>
                      <span className='file-label'>
                      Choose a file…
                      </span>
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className='navbar-item'>
              <input className='button' type='submit' value='Upload' />
            </div>

          </form>

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
              {isMenuOpen ? <TaskForm
                key={form.id + '-form'}
                form={form}
                teamNames={dbs ? dbs.sprints.map(sprint => ({ value: sprint.teamName, label: sprint.teamName })) : []}
                stories={dbs ? dbs.stories.map(({ id, summary }) => ({ value: id, label: `#${id}: ${summary}` })) : []}
                tasks={dbs ? dbs.tasks.map(({ id, summary }) => ({ value: id, label: `#${id}: ${summary}` })) : []}
              /> : ''}
            </div>
          </div>
        </div>
      </nav>

      {(!dbs) ? 'Loading' : <div className='content'>
        <Stories storiesFilter={storiesFilter} tasks={dbs.tasks} stories={dbs.stories} />

        <Sprints setData={setData} tasks={dbs.tasks} sprints={dbs.sprints} />

        <Relations tasks={dbs.tasks} selectedId={form.id} />

        <ProgramBoard storyIndex={dbs.storyIndex} taskStoryIndex={dbs.taskStoryIndex} stories={dbs.stories} tasks={dbs.tasks} sprints={dbs.sprints} />

        <RelationsProgramBoard tasks={dbs.tasks} selectedStory={selectedStory} />
      </div>}
    </AppContext.Provider>
  </div>
}
export default App

import React from 'react'
import axios from 'axios'
import use from 'react-hoox'
import { format } from 'date-fns'
import io from 'socket.io-client'

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

const NETWORK = process.env.NETWORK || 'ws'
let socket

if (NETWORK === 'ws') {
  socket = io('/')
  socket.on('db', (data) => {
    const parsedData = JSON.parse(data)

    parsedData.sprints.forEach(sprint => {
      sprint.dirty = false
    })

    dbs = parsedData
  })
  socket.on('connect', () => {
    console.log('connect')
  })
}

const App = () => {
  use(() => isMenuOpen)
  use(() => isCompact)
  use(() => selectedStory)
  use(() => form.id)
  use(() => dbs && dbs.sprints)
  use(() => dbs && dbs.tasks)
  use(() => storiesFilter)

  const clearForm = () => {
    form = { ...defaultForm }
    isMenuOpen = false
  }

  const setData = (data) => {
    socket.emit('sprint:update', JSON.stringify(data))
  }

  const updateTask = (data) => {
    socket.emit('task:update', JSON.stringify(data))
    clearForm()
  }

  const deleteTask = (id) => {
    const taskToRemoveId = id
    if (dbs.dependendTasks[taskToRemoveId] && dbs.dependendTasks[taskToRemoveId].length) {
      window.alert(`please clear relations with ${dbs.dependendTasks[taskToRemoveId]}`)
      return
    }
    if (window.confirm('sure?')) {
      socket.emit('task:delete', taskToRemoveId)
      clearForm()
    }
  }

  const updateColumnCount = (columnId, teamName, size) => {
    axios.patch(api.columns + '/' + columnId, { teamName, size })
    socket.emit('column:count', JSON.stringify({ columnId, teamName, size }))
  }

  const selectTask = (taskData) => {
    isMenuOpen = true
    form = taskData
  }

  const selectStory = story => (selectedStory = (selectedStory !== story ? story : ''))

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
                key={(form.id || 'empty') + '-form'}
                form={form}
                teamNames={dbs ? dbs.sprints.map(sprint => ({ value: sprint.teamName, label: sprint.teamName })) : []}
                stories={dbs ? dbs.stories.map(({ id, summary }) => ({ value: id, label: `#${id}: ${summary.substr(0, 15)}`, fullLabel: `#${id}: ${summary}` })) : []}
                tasks={dbs ? dbs.tasks.map(({ id, summary }) => ({ value: id, label: `#${id}: ${summary.substr(0, 15)}` })) : []}
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

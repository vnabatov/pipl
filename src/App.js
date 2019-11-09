import React from 'react'
import axios from 'axios'
import use from 'react-hoox'
import { format } from 'date-fns'
import io from 'socket.io-client'

import Sprints from './components/Sprints'
import Navbar from './components/Navbar'
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
let isCompact = true
let showRelations = true
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
  use(() => form.id)
  use(() => isMenuOpen)
  use(() => showRelations)
  use(() => isCompact)
  use(() => selectedStory)
  use(() => dbs && dbs.sprints)
  use(() => dbs && dbs.taskLastUpdate)
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
    form.oldId = taskData.id
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

  const addStory = (story) => {
    socket.emit('story:create', JSON.stringify(story))
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
      isCompact,
      selectedId: form.id
    }}>

      <Navbar {...{ downloadDb,
        isCompact,
        form,
        dbs,
        isMenuOpen,
        showRelations,
        menuToggle: () => (isMenuOpen = !isMenuOpen),
        relationsToggle: () => (showRelations = !showRelations),
        allRelationsToggle: () => (form.id = (form.id === 'all' ? '' : 'all')),
        compactToggle: () => (isCompact = !isCompact)
      }} />

      {(!dbs) ? 'Loading' : <div className='content'>
        <Stories addStory={addStory} storiesFilter={storiesFilter} tasks={dbs.tasks} stories={dbs.stories} />

        <Sprints setData={setData} tasks={dbs.tasks} sprints={dbs.sprints} />

        <ProgramBoard storyIndex={dbs.storyIndex} taskStoryIndex={dbs.taskStoryIndex} stories={dbs.stories} tasks={dbs.tasks} sprints={dbs.sprints} />

        {showRelations && <Relations tasks={dbs.tasks} selectedId={form.id} />}

        {showRelations && <RelationsProgramBoard showRelations={showRelations} tasks={dbs.tasks} selectedStory={selectedStory} />}
      </div>}
    </AppContext.Provider>
  </div>
}
export default App

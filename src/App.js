import React, { Fragment } from 'react'
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
import RelationsProgramBoardStories from './components/RelationsProgramBoardStories'
import ReactSelect from 'react-select'

import 'bulma/css/bulma.css'
import './App.css'
import ProgramBoard from './components/ProgramBoard'
// import VersionBoard from './components/VersionBoard'

const api = { db: '/db', tasks: '/tasks', sprints: '/sprints', columns: '/columns' }
const defaultForm = { id: '', description: 'empty', teamName: '', summary: '', related: '', sp: '', story: '' }

let form = { ...defaultForm }
let isMenuOpen = false
let allRelations = false
let isCompact = true
let showRelations = true
let selectedStory = ''
let selectedTask = ''
let taskFilter = ''
let BUFilter = 'All'
let relationsRedraw = ''
const defaultComponentFilter = { value: 0, label: 'All Components' }
let componentFilter = defaultComponentFilter;

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
    console.log('dbs', dbs)
  })
  socket.on('connect', () => {
    console.log('connect')
  })
}

const NavbarContainer = () => {
  use(() => form.id)
  use(() => isMenuOpen)
  use(() => relationsRedraw)
  use(() => showRelations)
  use(() => allRelations)
  use(() => isCompact)
  use(() => dbs && dbs.sprints.map(({ teamName }) => teamName))
  use(() => dbs && dbs.taskLastUpdate)
  use(() => taskFilter)
  use(() => BUFilter)

  const clearForm = () => {
    form = { ...defaultForm }
    isMenuOpen = false
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

  const downloadCSV = () => {
    function downloadURI (uri, name) {
      var link = document.createElement('a')
      link.download = name
      link.href = uri
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
    downloadURI('dbCSV', format(new Date(), 'yyyy-MM-dd_HH_mm_ss') + '-PIPL.csv')
  }

  return <div className='container is-widescreen'>
    <AppContext.Provider value={{
      deleteTask,
      updateTask,
      clearForm,
      dependendTasks: dbs && dbs.dependendTasks,
      taskPostionsCache: dbs && dbs.taskPostionsCache,
      isCompact
    }}>

      <Navbar {...{
        downloadDb,
        downloadCSV,
        isCompact,
        form,
        dbs,
        taskFilter,
        updateTaskFilter: (v) => (taskFilter = v),
        BUFilter,
        updateBUFilter: (v) => (BUFilter = v),
        isMenuOpen,
        allRelations,
        showRelations,
        menuToggle: () => (isMenuOpen = !isMenuOpen),
        menuClose: () => (isMenuOpen = false),
        relationsToggle: () => (showRelations = !showRelations),
        allRelationsToggle: () => (allRelations = !allRelations),
        compactToggle: () => (isCompact = !isCompact)
      }} />
      {showRelations && dbs && <RelationsProgramBoard showRelations={showRelations} relationsRedraw={relationsRedraw} tasks={dbs.tasks} selectedStory={selectedStory} />}
      {showRelations && dbs && <RelationsProgramBoardStories showRelations={showRelations} relationsRedraw={relationsRedraw} stories={dbs.stories} selectedStory={selectedStory} />}
      {showRelations && dbs && <Relations allRelations={allRelations} relationsRedraw={relationsRedraw} tasks={dbs.tasks} selectedId={form.id} />}
    </AppContext.Provider>
  </div>
}

const Content = () => {
  use(() => showRelations)
  use(() => isCompact)
  use(() => selectedStory)
  use(() => selectedTask)
  use(() => dbs && dbs.sprints)
  use(() => dbs && dbs.taskLastUpdate)
  use(() => storiesFilter)
  use(() => allRelations)
  use(() => taskFilter)
  use(() => BUFilter)
  use(() => componentFilter)

  const setComponentFilter = (component) => {
    componentFilter = component
  }

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
    // selectedTask = taskData.id
  }

  const redrawRelations = () => {
    relationsRedraw = Date.now()
  }

  const selectStory = story => {
    selectedStory = (selectedStory !== story ? story : '')
    setTimeout(redrawRelations, 1000)
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
      selectedTask,
      redrawRelations,
      clearForm,
      taskLastUpdate: dbs && dbs.taskLastUpdate,
      selectedStory,
      dependendTasks: dbs && dbs.dependendTasks,
      taskPostionsCache: dbs && dbs.taskPostionsCache,
      isCompact
    }}>
      {(!dbs) ? 'Loading' : <div className='content'>
        <div style={{width: '300px'}}>
          <ReactSelect
            isMulti
            key="component-select"
            options={[defaultComponentFilter, ...dbs.components.map((component) => ({ value: component, label: component }))]}
            value={componentFilter}
            onChange={setComponentFilter}
          />
        </div>

        {selectedStory ? <button onClick={() => selectStory('')}>Selected Epic: {selectedStory}&times;</button> : ''}

        <Stories BUFilter={BUFilter} addStory={addStory} storiesFilter={storiesFilter} tasks={dbs.tasks} stories={dbs.stories} />

        <Sprints BUFilter={BUFilter} componentFilter={componentFilter} taskFilter={taskFilter} setData={setData} tasks={dbs.tasks} sprints={dbs.sprints} />

        <ProgramBoard BUFilter={BUFilter} taskFilter={taskFilter} storyIndex={dbs.storyIndex} taskStoryIndex={dbs.taskStoryIndex} stories={dbs.stories} tasks={dbs.tasks} sprints={dbs.sprints} />

        {/* <VersionBoard storyIndex={dbs.storyIndex} taskStoryIndex={dbs.taskStoryIndex} stories={dbs.stories} tasks={dbs.tasks} sprints={dbs.sprints} /> */}

      </div>}
    </AppContext.Provider>
  </div>
}

const App = () => {
  return <Fragment>
    <NavbarContainer />
    <Content />
  </Fragment>
}
export default App

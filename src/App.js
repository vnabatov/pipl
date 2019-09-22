import React, { Fragment, useEffect } from 'react'
import axios from 'axios'
import use from 'react-hoox'

import './App.css'

import SprintsTable from './components/SprintsTable'
import TaskForm from './components/TaskForm'

const api = { db: '/db', tasks: '/tasks', sprints: '/sprints' }
const defaultForm = { id: '', teamName: 'Already Done', summary: '', related: '', sp: '', story: '' }

let form = { ...defaultForm }
let dbs

const App = () => {
  use(() => form)
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

  useEffect(() => {
    fetchData()
    setInterval(() => fetchData(), 3000)
  }, [])

  return <Fragment>
    <TaskForm form={form} updateTask={updateTask} deleteTask={deleteTask} clearForm={clearForm} />
    {dbs
      ? dbs.sprints.map((sprint, key) => <div className='App'>
        <SprintsTable
          tasksDb={dbs.tasks}
          sprintDb={sprint}
          setData={setData}
          key={key}
          deleteTask={deleteTask}
          selectTask={selectTask}
        />
      </div>)
      : <div>loading...</div>}
  </Fragment>
}
export default App

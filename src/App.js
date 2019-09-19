import React, { Fragment, useEffect } from 'react'
import axios from 'axios'
import use from 'react-hoox'

import './App.css'

import SprintsTable from './components/SprintsTable'
import TaskForm from './components/TaskForm'

const api = { db: '/db', tasks: '/tasks', sprints: '/sprints' }
const defaultForm = { id: 'CPP0-', teamName: 'Already Done', summary: '', related: '', sp: '0', story: '' }

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

  const createTask = () => {
    axios.post(api.tasks, form)
    form = defaultForm
  }

  const updateTask = () => {
    axios.patch(api.tasks + '/' + form.id, form)
    form = defaultForm
  }

  const deleteTask = (id) => {
    axios.delete(api.tasks + '/' + id || form.id)
    form = defaultForm
  }

  useEffect(() => {
    fetchData()
    setInterval(() => fetchData(), 3000)
  }, [])

  return <Fragment>
    <TaskForm form={form} createTask={createTask} updateTask={updateTask} deleteTask={deleteTask} />
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

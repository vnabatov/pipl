import React, { useEffect } from 'react'
import axios from 'axios'
import use from 'react-hoox'

import 'bulma/css/bulma.css'
import 'font-awesome/*'
import './App.css'

import SprintsTable from './components/SprintsTable'
import TaskForm from './components/TaskForm'

const api = { db: '/db', tasks: '/tasks', sprints: '/sprints', columns: '/columns' }
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

  const updateColumnCount = (columnId, teamName, size) => {
    axios.patch(api.columns + '/' + columnId, { teamName, size })
  }

  useEffect(() => {
    fetchData()
    setInterval(() => fetchData(), 3000)
  }, [])

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
    {dbs
      ? dbs.sprints.map((sprint, key) => <div className='App'>
        <SprintsTable
          updateColumnCount={updateColumnCount}
          tasksDb={dbs.tasks}
          sprintDb={sprint}
          setData={setData}
          key={key}
          deleteTask={deleteTask}
          selectTask={selectTask}
        />
      </div>)
      : <div>loading...</div>}
  </div>
}
export default App

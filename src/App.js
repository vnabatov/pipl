import React, { Component, Fragment } from 'react'
import use from 'react-hoox'

import axios from 'axios'
import './App.css'
import SprintsTable from './components/SprintsTable'

const api = { db: '/db', tasks: '/tasks', sprints: '/sprints' }
const defaultForm = { id: 'CPP0-', teamName: 'Already Done', summary: '', related: '', sp: '0', story: '' }
const form = defaultForm;

export default class App extends Component {
  constructor (props) {
    use(form)
    super(props)
    this.state = { dbs: null }
  }

  fetchData () {
    axios.get(api.db).then(({ data }) => {
      data.sprints.forEach(sprint => {
        sprint.dirty = false
      })
      this.setState({ dbs: data })
    })
  }

  setData (data) {
    axios.patch(api.sprints, data)
  }

  selectTask (taskData) {
    form = taskData
  }

  createTask () {
    axios.post(api.tasks, form)
    form = defaultForm;
  }

  updateTask () {
    axios.patch(api.tasks + '/' + form.id, form)
    form = defaultForm;
  }

  deleteTask (id) {
    axios.delete(api.tasks + '/' + id || form.id)
    form = defaultForm;
  }

  componentDidMount () {
    this.fetchData()
    this.timer = setInterval(() => this.fetchData(), 3000)
  }

  updateForm (field, value) {
    form[field] = value
  }

  render () {
    const { dbs } = this.state
    return <Fragment>
      <div>Create Task</div>
      id:<input type='text' value={form.id} onChange={e => this.updateForm('id', e.target.value)} /><br />
      summary:<input type='text' value={form.summary} onChange={e => this.updateForm('summary', e.target.value)} /><br />
      teamName:<input type='text' value={form.teamName} onChange={e => this.updateForm('teamName', e.target.value)} /><br />
      related:<input type='text' value={form.related} onChange={e => this.updateForm('related', e.target.value)} /><br />
      sp:<input type='text' value={form.sp} onChange={e => this.updateForm('sp', e.target.value)} /><br />
      story:<input type='text' value={form.story} onChange={e => this.updateForm('story', e.target.value)} /><br />
      <input type='button' value='Create' onClick={() => this.createTask()} /><br />
      <input type='button' value='Update' onClick={() => this.updateTask()} /><br />
      <input type='button' value='Delete' onClick={() => this.deleteTask()} />
      {dbs
        ? dbs.sprints.map((sprint, key) => <div className='App'>
          <SprintsTable deleteTask={id => this.deleteTask(id)} selectTask={taskData => this.selectTask(taskData)} key={key} tasksDb={dbs.tasks} sprintDb={sprint} setData={(data, key) => this.setData(data, key)} />
        </div>)
        : <div>loading...</div>}
    </Fragment>
  }
}

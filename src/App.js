import React, { Component } from 'react'
import axios from 'axios'
import './App.css'
import SprintsTable from './components/SprintsTable'

const dbServer = '/db'

export default class App extends Component {
  constructor (props) {
    super(props)
    this.state = { dbs: null }
  }

  fetchData () {
    axios.get(dbServer).then(({ data }) => {
      Object.entries(data).forEach(([key, db]) => {
        db.dirty = false
      })
      this.setState({ dbs: data })
    })
  }

  setData (data, key) {
    const { dbs } = this.state
    dbs[key] = data
    axios.post(dbServer, dbs)
  }

  componentDidMount () {
    this.fetchData()
    this.timer = setInterval(() => this.fetchData(), 3000)
  }

  render () {
    const { dbs } = this.state
    return dbs
      ? Object.entries(dbs).map(([key, db]) => <div className='App'>
        <SprintsTable key={key} database={db} setData={(data, key) => this.setData(data, key)} />
      </div>)
      : <div>loading...</div>
  }
}

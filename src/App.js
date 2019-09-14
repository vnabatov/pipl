import React, { Component } from 'react'
import axios from 'axios'
import './App.css'
import SprintsTable from './components/SprintsTable'

const dbServer = '/db'
const setData = async (body) => axios.post(dbServer, body)

export default class App extends Component {
  constructor (props) {
    super(props)
    this.state = { database: null }
  }

  fetchData () { axios.get(dbServer).then(({ data: database }) => { this.setState({ database }) }) }
  setData (body) { axios.post(dbServer, body) }

  componentDidMount () {
    this.fetchData()
    this.timer = setInterval(() => this.fetchData(), 5000)
  }

  render () {
    const { database } = this.state
    return database
      ? <div className='App'>
        <SprintsTable database={database} setData={setData} />
      </div>
      : <div>loading...</div>
  }
}

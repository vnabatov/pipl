import React from 'react'
import './App.css'
import SprintsTable from './components/SprintsTable'
import use from 'react-hoox'

const App = () => {
  return <div className='App'>
    <SprintsTable changeData={e => (database.value = e.target.value)} />
  </div>
}

export default App

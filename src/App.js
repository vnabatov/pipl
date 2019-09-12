import React from 'react'
import './App.css'
import SprintsTable from './components/SprintsTable'
import use from 'react-hoox'

const database = { value: 0 };

const App = () => {
  use(database)
  return <div className='App'>
    {database.value}

    <SprintsTable changeData={e => database.value = e.target.value}/>
  </div>
}

export default App

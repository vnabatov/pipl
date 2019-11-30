import React from 'react'
import { create } from 'react-test-renderer'
import TaskForm from '../src/components/TaskForm'
import AppContext from '../src/AppContext'

describe('TaskForm', () => {
  test('Matches the snapshot', () => {
    const taskForm = create(<AppContext.Provider value={{
      deleteTask: () => {},
      updateTask: () => {},
      clearForm: () => {},
      dependendTasks: {},
      taskPostionsCache: {},
      isCompact: false
    }}><TaskForm /></AppContext.Provider>)
    expect(taskForm.toJSON()).toMatchSnapshot()
  })
})

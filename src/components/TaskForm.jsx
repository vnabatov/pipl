import React from 'react'
import styled from 'styled-components'
import ReactSelect from 'react-select'
import AppContext from '../AppContext'

const Form = styled.div`
padding: 1rem;
`
const Button = styled.input`
margin-right: 0.5rem;
`

const fields = ['id', 'summary', 'sp']

export default ({ form, teamNames = [], stories = [], tasks = [] }) => {
  const updateForm = (field, value) => {
    form[field] = value
  }

  const relatedTasks = form.related ? form.related.split(',') : []
  // todo: rid from string implementation of relatedTasks
  const relatedTasksSelected = tasks.filter(i => relatedTasks.includes(i.value))

  return (
    <AppContext.Consumer>
      {({ deleteTask, updateTask, clearForm }) => <Form>
      {fields.map(field => <div className='field is-horizontal' key={field}>
        <div className='field-label is-small'>
          <label className='label'>{field}</label>
        </div>
        <div className='field-body'>
          <div className='field'>
            <div className='control'>
              <input className='input is-small' type='text' value={form[field]} onChange={e => updateForm(field, e.target.value)} />
            </div>
          </div>
        </div>
      </div>)}

      {teamNames.length && <div className='field is-horizontal'>
        <div className='field-label is-small'>
          <label className='label'>teamName</label>
        </div>
        <div className='field-body'>
          <div className='field'>
            <div className='control'>
              <ReactSelect
                options={teamNames}
                value={form['teamName']}
                onChange={selectedOption => updateForm('teamName',selectedOption)}
              />
            </div>
          </div>
        </div>
      </div>}

      {stories.length && <div className='field is-horizontal'>
        <div className='field-label is-small'>
          <label className='label'>story</label>
        </div>
        <div className='field-body'>
          <div className='field'>
            <div className='control'>
              <ReactSelect
                options={stories}
                value={form['story']}
                onChange={selectedOption => updateForm('story',selectedOption)}
              />
            </div>
          </div>
        </div>
      </div>}

      {tasks.length && <div className='field is-horizontal'>
        <div className='field-label is-small'>
          <label className='label'>Depends On {relatedTasks && relatedTasks.length && relatedTasks.join(', ')}</label>
        </div>
        <div className='field-body'>
          <div className='field'>
            <div className='control'>
              <ReactSelect
                options={tasks.filter(i => i.value !== form['id'])}
                isMulti
                value={relatedTasksSelected}
                onChange={selectedOption => updateForm(
                  'related',
                  selectedOption.length ? selectedOption.map(selected => selected.value).join(',') : '')
                }
              />
            </div>
          </div>
        </div>
      </div>}

      <div className='field is-horizontal'>
        <div className='field-label is-normal' />
        <div className='field-body'>
          <div className='field'>
            <p className='control'>
              <Button className='button is-primary' type='button' value='Save' onClick={updateTask} />
              <Button className='button is-warning' type='button' value='Delete' onClick={() => deleteTask()} />
              <Button className='button' type='button' value='Clear' onClick={clearForm} />
            </p>
          </div>
        </div>
      </div>
    </Form>
    }
    </AppContext.Consumer>
  )
}

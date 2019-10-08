import React from 'react'
import styled from 'styled-components'
import SelectSearch from 'react-select-search'
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

  const relatedTasks = form.related ? form.related.split(',') : null

  return (
    <AppContext.Consumer>{({ deleteTask, updateTask, clearForm }) => <Form>
      {fields.map(field => <div className='field is-horizontal'>
        <div className='field-label is-small'>
          <label className='label'>{field}</label>
        </div>
        <div className='field-body'>
          <div className='field'>
            <p className='control'>
              <input className='input is-small' type='text' value={form[field]} onChange={e => updateForm(field, e.target.value)} />
            </p>
          </div>
        </div>
      </div>)}

      {teamNames.length && <div className='field is-horizontal'>
        <div className='field-label is-small'>
          <label className='label'>teamName</label>
        </div>
        <div className='field-body'>
          <div className='field'>
            <p className='control'>
              <SelectSearch options={teamNames} value={form['teamName']} onChange={e => updateForm('teamName', e.value)} />
            </p>
          </div>
        </div>
      </div>}

      {stories.length && <div className='field is-horizontal'>
        <div className='field-label is-small'>
          <label className='label'>story</label>
        </div>
        <div className='field-body'>
          <div className='field'>
            <p className='control'>
              <SelectSearch options={stories} value={form['story']} onChange={e => updateForm('story', e.value)} />
            </p>
          </div>
        </div>
      </div>}

      {tasks.length && <div className='field is-horizontal'>
        <div className='field-label is-small'>
          <label className='label'>Depends On</label>
        </div>
        <div className='field-body'>
          <div className='field'>
            <p className='control'>
              <SelectSearch options={tasks}
                key={JSON.stringify(relatedTasks)}
                multiple
                value={relatedTasks}
                height={100}
                onChange={e => updateForm('related', e.length ? e.map(selected => selected.value).join(',') : '')}
              />
            </p>
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
              <Button className='button is-light' type='button' value='Relations' onClick={() => updateForm('id', 'all')} />
            </p>
          </div>
        </div>
      </div>
    </Form>
    }
    </AppContext.Consumer>
  )
}

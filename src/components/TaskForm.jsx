import React, { useState } from 'react'
import styled from 'styled-components'
import ReactSelect from 'react-select'
import AppContext from '../AppContext'

const Form = styled.div`
padding: 1rem;
`
const Button = styled.input`
margin-right: 0.5rem;
`

export default ({ form = {}, teamNames = [], stories = [], tasks = [] }) => {
  const [id, setId] = useState(form.id)
  const [description, setDescription] = useState(form.description)
  const [related, setRelated] = useState(form.related)
  const [sp, setSp] = useState(form.sp)
  const [story, setStory] = useState(form.story)
  const [summary, setSummary] = useState(form.summary)
  const [teamName, setTeamName] = useState(form.teamName)

  const getStory = s => stories.find(storyObj => storyObj.value === s)

  const relatedTasks = related ? related.split(',') : []
  // todo: rid from string implementation of relatedTasks
  const relatedTasksSelected = tasks.filter(i => relatedTasks.includes(i.value))
  return (
    <AppContext.Consumer>
      {({ deleteTask, updateTask, clearForm }) => <Form>

        <div className='field is-horizontal' key={'id'}>
          <div className='field-label is-small'>
            <label className='label'>id</label>
          </div>
          <div className='field-body'>
            <div className='field'>
              <div className='control'>
                <input className='input is-small' type='text' defaultValue={id} onChange={e => setId(e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        <div className='field is-horizontal' key={'description'}>
          <div className='field-label is-small'>
            <label className='label'>description</label>
          </div>
          <div className='field-body'>
            <div className='field'>
              <div className='control'>
                <input className='input is-small' type='text' value={description} onChange={e => setDescription(e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        <div className='field is-horizontal' key={'sp'}>
          <div className='field-label is-small'>
            <label className='label'>sp</label>
          </div>
          <div className='field-body'>
            <div className='field'>
              <div className='control'>
                <input className='input is-small' type='text' value={sp} onChange={e => setSp(e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        <div className='field is-horizontal' key={'summary'}>
          <div className='field-label is-small'>
            <label className='label'>summary</label>
          </div>
          <div className='field-body'>
            <div className='field'>
              <div className='control'>
                <input className='input is-small' type='text' value={summary} onChange={e => setSummary(e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        {teamNames.length && <div className='field is-horizontal'>
          <div className='field-label is-small'>
            <label className='label'>teamName</label>
          </div>
          <div className='field-body'>
            <div className='field'>
              <div className='control'>
                <ReactSelect
                  options={teamNames}
                  value={{ value: teamName, label: teamName }}
                  onChange={selectedOption => setTeamName(selectedOption.value)}
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
              <div className='control' title={getStory(story) ? getStory(story).fullLabel : ''}>
                <ReactSelect
                  key={story}
                  options={stories}
                  value={{ value: story, label: story && getStory(story) ? getStory(story).label : '' }}
                  onChange={selectedOption => {
                    console.log(selectedOption.value)
                    setStory(selectedOption.value)
                  }
                  }
                />
              </div>
            </div>
          </div>
        </div>}

        {tasks.length && <div className='field is-horizontal'>
          <div className='field-label is-small'>
            <label className='label'>Depends On</label>
          </div>
          <div className='field-body'>
            <div className='field'>
              <div className='control'>
                <ReactSelect
                  options={tasks.filter(i => i.value !== id)}
                  isMulti
                  value={relatedTasksSelected}
                  onChange={selectedOption => setRelated(
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
                <Button className='button is-primary' type='button' value='Save' onClick={() => teamName && summary ? updateTask({ id, description, related, sp, story, summary, teamName, oldId: form.oldId }) : window.alert('Select Team and Fill Summary')} />
                <Button className='button is-warning' type='button' value='Delete' onClick={() => deleteTask(id)} />
                <Button className='button' type='button' value='Close' onClick={clearForm} />
              </p>
            </div>
          </div>
        </div>
      </Form>
      }
    </AppContext.Consumer>
  )
}

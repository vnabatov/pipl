import React from 'react'
import styled from 'styled-components'

const Form = styled.div`
width: 40%;
padding: 1rem;
`
const Button = styled.input`
margin-right: 0.5rem;
`

const fields = ['id', 'summary', 'teamName', 'related', 'sp', 'story']

export default ({ form, updateTask, deleteTask, clearForm }) => {
  const updateForm = (field, value) => {
    form[field] = value
  }
  return <Form className='hero'>
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

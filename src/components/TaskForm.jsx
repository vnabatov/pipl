import React, { Fragment } from 'react'

export default ({ form, createTask, updateTask, deleteTask }) => {
  const updateForm = (field, value) => {
    form[field] = value
  }
  return <Fragment>
    <div>Create Task</div>
      id:<input type='text' value={form.id} onChange={e => updateForm('id', e.target.value)} /><br />
      summary:<input type='text' value={form.summary} onChange={e => updateForm('summary', e.target.value)} /><br />
      teamName:<input type='text' value={form.teamName} onChange={e => updateForm('teamName', e.target.value)} /><br />
      related:<input type='text' value={form.related} onChange={e => updateForm('related', e.target.value)} /><br />
      sp:<input type='text' value={form.sp} onChange={e => updateForm('sp', e.target.value)} /><br />
      story:<input type='text' value={form.story} onChange={e => updateForm('story', e.target.value)} /><br />
    <input type='button' value='Create' onClick={createTask} /><br />
    <input type='button' value='Update' onClick={updateTask} /><br />
    <input type='button' value='Delete' onClick={deleteTask} />
  </Fragment>
}

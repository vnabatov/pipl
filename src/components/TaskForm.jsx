import React from 'react'
import styled from 'styled-components'

const Form = styled.div``

const Grid = styled.div`
display: grid;
grid-template-rows: 1fr 1fr;
grid-template-columns: 1fr 1fr;

grid-row-gap: 3px;
`

const Label = styled.div`
padding: 3px;
text-align:right;
text-transform: capitalize;
padding-right: 10px;
`
const Input = styled.input`
padding: 3px;
width: 100%;
box-sizing: border-box;
outline: none;
border: none;
border-radius: 2px;
background-color: #ddd;

&:active,
&:focus {
  background-color: lightcyan;
}
`

const Button = styled.input`
padding: 3px;
margin-right: 3px;
border-radius: 2px;
width: 100%;
border: none;
margin-bottom: 3px;
background-color: coral;
width: 100px;
outline: none;
border: none;
&:hover {
  background-color: palevioletred;
  color: white;
}
`

export default ({ form, updateTask, deleteTask, clearForm }) => {
  const updateForm = (field, value) => {
    form[field] = value
  }
  return <Form>
    <Grid>
      <Label>id</Label><Input type='text' value={form.id} onChange={e => updateForm('id', e.target.value)} />
      <Label>summary</Label><Input type='text' value={form.summary} onChange={e => updateForm('summary', e.target.value)} />
      <Label>teamName</Label><Input type='text' value={form.teamName} onChange={e => updateForm('teamName', e.target.value)} />
      <Label>related</Label><Input type='text' value={form.related} onChange={e => updateForm('related', e.target.value)} />
      <Label>sp</Label><Input type='text' value={form.sp} onChange={e => updateForm('sp', e.target.value)} />
      <Label>story</Label><Input type='text' value={form.story} onChange={e => updateForm('story', e.target.value)} />
      <Label>Actions</Label>
      <div>
        <Button type='button' value='Add/Edit' onClick={updateTask} />
        <Button type='button' value='Delete' onClick={() => deleteTask()} />
        <Button type='button' value='Clear' onClick={clearForm} />
      </div>
    </Grid>

  </Form>
}

import axios from 'axios'

const api = { db: '/db', tasks: '/tasks', sprints: '/sprints', columns: '/columns' }

const getData = () => {
  return axios.get(api.db)
}

const deleteTask = (id, form, cb) => {
  // eslint-disable-next-line no-undef
  if (window.confirm('sure?')) {
    axios.delete(api.tasks + '/' + (id || form.id))
    cb()
  }
}

const updateTask = (form, cb) => {
  axios.post(api.tasks, form)
  cb()
}

const updateColumnCount = (columnId, teamName, size) => {
  axios.patch(api.columns + '/' + columnId, { teamName, size })
}

const setData = (data) => {
  axios.patch(api.sprints, data)
}

export default { getData, deleteTask, updateTask, updateColumnCount, setData }

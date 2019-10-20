import React from 'react'

import LineTo from 'react-lineto'

const showRelationForTask = (link, task, color = 'red') => {
  const style = {
    borderColor: color,
    borderStyle: 'solid',
    borderWidth: 1
  }
  return task !== link && document.querySelector(`.story${link}`) && document.querySelector(`.story${task}`)
    ? <LineTo fromAnchor='right' toAnchor='left' {...style} from={`story${link}`} to={`story${task}`} />
    : ''
}

export default ({ tasks }) => {
  let isBlockedBy
  return tasks.map(task => {
    isBlockedBy = []
    if (task.related) {
      isBlockedBy.push(task.related.split(',').map((link) => showRelationForTask(link, task.id, 'red')))
      return [...isBlockedBy]
    } else {
      return ''
    }
  })
}

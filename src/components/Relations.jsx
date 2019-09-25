import React from 'react'

import LineTo from 'react-lineto'

const showRelationForTask = (link, task, color = 'red') => {
  const style = {
    delay: true,
    borderColor: color,
    borderStyle: 'solid',
    borderWidth: 2
  }
  return task !== link && document.querySelector(`.task${link}`) && document.querySelector(`.task${link}`)
    ? <LineTo fromAnchor='right' toAnchor='left' {...style} from={`task${link}`} to={`task${task}`} />
    : ''
}

export default ({ tasks, selectedId }) => {
  const isBlockedBy = []
  const blocks = []
  return tasks.map(task => {
    if (task.related) {
      const isSelected = selectedId === 'all' || selectedId === task.id
      const hasRelationsToSelected = !isSelected && task.related.split(',').includes(selectedId)
      if (isSelected) {
        isBlockedBy.push(task.related.split(',').map((link) => showRelationForTask(link, task.id, 'red')))
      }
      if (hasRelationsToSelected) {
        blocks.push(task.related.split(',').map((link) => link === selectedId ? showRelationForTask(link, task.id, 'green') : ''))
      }
      if (hasRelationsToSelected) {
        blocks.push(task.related.split(',').map((link) => link !== selectedId ? showRelationForTask(link, task.id, 'gray') : ''))
      }
      return [...isBlockedBy, ...blocks]
    } else {
      return ''
    }
  })
}

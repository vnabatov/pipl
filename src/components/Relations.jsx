import React from 'react'

import LineTo from 'react-lineto'

const showRelationForTask = (link, task, color = 'red') => {
  const style = {
    borderColor: color,
    borderStyle: 'solid',
    borderWidth: 2
  }
  return task !== link && document.querySelector(`.task${link}`) && document.querySelector(`.task${task}`)
    ? <LineTo key={`task${link}-task${task}`} fromAnchor='right' toAnchor='left' {...style} from={`task${link}`} to={`task${task}`} />
    : ''
}

export default ({ tasks, selectedId, allRelations }) => {
  let isBlockedBy = []
  let blocks = []
  if (!selectedId && !allRelations) {
    return ''
  }
  return tasks.map(task => {
    isBlockedBy = []
    blocks = []
    if (task.related) {
      const isSelected = allRelations || selectedId === task.id
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

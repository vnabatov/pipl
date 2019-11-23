import React from 'react'

import LineTo from 'react-lineto'

const showRelationForTask = (link, task, color = 'red') => {
  const style = {
    borderColor: color,
    borderStyle: 'solid',
    borderWidth: 1
  }
  return task !== link && document.querySelector(`.story${link}`) && document.querySelector(`.story${task}`)
    ? <LineTo key={`story${link}-story${task}`} fromAnchor='right' toAnchor='left' {...style} from={`story${link}`} to={`story${task}`} />
    : ''
}

export default ({ tasks, selectedStory, relationsRedraw }) => {
  let isBlockedBy
  return tasks.map(task => {
    isBlockedBy = []
    if (task.related) {
      if (!selectedStory || task.story === selectedStory) {
        isBlockedBy.push(task.related.split(',').map((link) => showRelationForTask(link, task.id, selectedStory ? 'green' : 'red')))
      }
      return [...isBlockedBy]
    } else {
      return ''
    }
  })
}

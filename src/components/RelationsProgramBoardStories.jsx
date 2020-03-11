import React from 'react'

import LineTo from 'react-lineto'

const showRelationForStory = (link, task, color = 'red') => {
  const style = {
    borderColor: color,
    borderStyle: 'solid',
    borderWidth: 1
  }
  return task !== link && document.querySelector(`.pbs-${link}`) && document.querySelector(`.pbs-${task}`)
    ? <LineTo key={`pbs-${link}-pbs-${task}`} fromAnchor='right' toAnchor='left' {...style} from={`pbs-${link}`} to={`pbs-${task}`} />
    : ''
}

export default ({ stories, selectedStory }) => {
  let isBlockedBy
  return stories && stories.length ? stories.map(story => {
    isBlockedBy = []
    if (story.relatedIssues && story.relatedIssues.length) {
      if (!selectedStory || story.id === selectedStory) {
        isBlockedBy.push(story.relatedIssues.map((link) => showRelationForStory(link, story.id, selectedStory ? 'blue' : 'purple')))
      }
      return isBlockedBy.length ? [...isBlockedBy] : null
    } else {
      return ''
    }
  }) : null
}

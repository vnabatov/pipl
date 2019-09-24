import Connector from 'connection-line'

const connector = new Connector({
  // selector, element or array with relative coords
  from: [0, 0],
  to: '.b',

  // smoothness of a line, 0 - straight line, 1 - smooth line
  smoothness: 0.5,

  // symbols on the line start/end/center
  lineEnd: '➜',
  lineStart: '•',
  lineMiddle: '✘',

  // force initial directions. By default the best one is chosen
  fromDirection: 'top',
  toDirection: 'bottom',

  // padding around the targets for initial direction
  padding: 20
})

document.body.appendChild(connector.element)

window.addEventListener('resize', function () {
  connector.update()
})

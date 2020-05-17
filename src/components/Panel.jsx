import React, { useState } from 'react'
import styled from 'styled-components'

import ToggleIcon from 'material-ui-toggle-icon'
import IconButton from '@material-ui/core/IconButton'
import Visibility from '@material-ui/icons/Visibility'
import VisibilityOff from '@material-ui/icons/VisibilityOff'
import { UnmountClosed } from 'react-collapse'
import AppContext from '../AppContext'

const Panelname = styled.div`
display: inline-block;
top: 2px;
position: relative;
font-weight: bold;
cursor: pointer;
&:hover {
  color: coral
}
`

export default ({ id, name, defaultOpen = false, children }) => {
  const [on, setOn] = useState(defaultOpen)
  const toggle = () => {}
  return (
    <AppContext.Consumer>
      {
        ({ redrawRelations }) =><div>
        <IconButton
          onClick={() => {
            setOn(!on)
            redrawRelations()
          }}
        >
          <ToggleIcon
            on={on}
            onIcon={<Visibility />}
            offIcon={<VisibilityOff />}
          />
        </IconButton>

        <Panelname 
          id={id}
          onClick={() => {
            setOn(!on)
            redrawRelations()
          }}>
          {name}
        </Panelname>
        <UnmountClosed isOpened={on}>
          {children}
        </UnmountClosed>
      </div>
    }
  </AppContext.Consumer>
)}

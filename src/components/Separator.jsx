import React from 'react'
import styled from 'styled-components'

const Separator = styled.div`
  font: 33px sans-serif;
  text-align: center;
  text-transform: uppercase;

  position: relative;
  
  &:before {
      border-top: 2px solid #dfdfdf;
      content:"";
      margin: 0 auto; /* this centers the line to the full width specified */
      position: absolute; /* positioning must be absolute here, and relative positioning must be applied to the parent */
      top: 50%; left: 0; right: 0; bottom: 0;
      width: 95%;
      z-index: -1;
  }

  span { 
      /* to hide the lines from behind the text, you have to set the background color the same as the container */ 
      background: #fff; 
      padding: 0 15px; 
  }
`

export default ({ header }) => (
  <Separator>
    <span>{header}</span>
  </Separator>
)

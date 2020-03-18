import styled from 'styled-components'

export default styled.div`
cursor: pointer;
${({ isOpened }) => isOpened ? 'font-weight:bold' : ''}}
&:hover {
  color: coral
}
&::before {
  content: '${({ isOpened }) => isOpened ? '🟢' : '🟠'} ';
}
`

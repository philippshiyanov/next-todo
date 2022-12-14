import { a, animated, config, useSpring } from '@react-spring/web'

import { ReactNode } from 'react'
import styled from 'styled-components'
import useMeasure from 'react-use-measure'
import usePrevious from './usePrevious'

const Content = styled(animated.div)`
  box-sizing: border-box;
  will-change: transform, opacity, height;
  overflow: hidden;
`
//DOESNT WORK WITH TAILWIND SO NEED TO USE ~styled-compnents~ thanks i hate it here
type WithChildren<T = {}> = T & { children?: ReactNode }

type TreeProps = WithChildren<{
  isOpen?: boolean
}>

export const Tree = ({ isOpen, children }: TreeProps) => {
  const previous = usePrevious(isOpen)
  const [ref, { height: viewHeight }] = useMeasure()
  const { height, opacity, y } = useSpring({
    config: config.default,
    from: { position: 'absolute', height: 0, opacity: 0, y: 0 },
    to: {
      height: isOpen ? viewHeight : 0,
      opacity: isOpen ? 1 : 0,
      y: isOpen ? 0 : 10,
    },
  })
  return (
    <Content
      style={{
        opacity: opacity,
        height: isOpen && previous === isOpen ? '100%' : height,
      }}
    >
      <a.div ref={ref} style={{ y }}>
        {children}
      </a.div>
    </Content>
  )
}

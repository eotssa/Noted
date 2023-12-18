import { useState, forwardRef, useImperativeHandle } from "react"
import { Button, Box, Group } from "@mantine/core"

const Togglable = forwardRef((props, refs) => {
  const [visible, setVisible] = useState(false)

  const toggleVisibility = () => {
    setVisible(!visible)
  }

  useImperativeHandle(refs, () => {
    return {
      toggleVisibility,
    }
  })

  return (
    <Box>
      {!visible && (
        <Group position="center" style={{ marginBottom: "1em" }}>
          <Button onClick={toggleVisibility}>{props.buttonLabel}</Button>
        </Group>
      )}

      {visible && (
        <Box className="togglableContent">
          {props.children}
          <Group position="center" style={{ marginTop: "1em" }}>
            <Button onClick={toggleVisibility}>Cancel</Button>
          </Group>
        </Box>
      )}
    </Box>
  )
})

Togglable.displayName = "Togglable"

export default Togglable

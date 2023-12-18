import { Paper, Text, Button, Group } from "@mantine/core"

const Note = ({ note, toggleImportance }) => {
  const label = note.important ? "Make not important" : "Make important"

  return (
    <Paper withBorder shadow="xs" p="md" radius="md">
      <Group position="apart" align="center">
        <Text>{note.content}</Text>
        <Button onClick={toggleImportance} size="xs" variant="outline">
          {label}
        </Button>
      </Group>
    </Paper>
  )
}

export default Note

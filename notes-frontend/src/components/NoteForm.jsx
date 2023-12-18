import { useState } from "react"
import { Button, TextInput, Paper, Title } from "@mantine/core"

const NoteForm = ({ createNote }) => {
  const [newNote, setNewNote] = useState("")

  const handleChange = (event) => {
    setNewNote(event.target.value)
  }

  const addNote = (event) => {
    event.preventDefault()
    createNote({
      content: newNote,
      important: true,
    })

    setNewNote("")
  }

  return (
    <Paper
      withBorder
      shadow="xs"
      p="md"
      radius="md"
      style={{ marginTop: "1em" }}
    >
      <Title order={2} style={{ marginBottom: "1em" }}>
        Create a new note
      </Title>

      <form onSubmit={addNote}>
        <TextInput
          value={newNote}
          onChange={handleChange}
          placeholder="Write note content here"
          id="note-input"
          style={{ marginBottom: "1em" }}
        />
        <Button type="submit">Save</Button>
      </form>
    </Paper>
  )
}

export default NoteForm

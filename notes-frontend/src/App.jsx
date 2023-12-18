import { useState, useEffect, useRef } from "react"
import Note from "./components/Note"
import Notification from "./components/Notification"
import Footer from "./components/Footer"
import "./index.css"
import LoginForm from "./components/Login"
import Togglable from "./components/Togglable"
import NoteForm from "./components/NoteForm"

import noteService from "./services/notes"
import loginService from "./services/login"

import "@mantine/core/styles.css"
import { Center, MantineProvider } from "@mantine/core"
import {
  Container,
  Divider,
  Title,
  List,
  Text,
  Button,
  Paper,
  Group,
} from "@mantine/core"

const App = () => {
  const [notes, setNotes] = useState([])
  const [newNote, setNewNote] = useState("")
  const [showAll, setShowAll] = useState(true)
  const [errorMessage, setErrorMessage] = useState(null)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [user, setUser] = useState(null)
  const [loginVisible, setLoginVisible] = useState(false)

  useEffect(() => {
    noteService.getAll().then((initialNotes) => {
      setNotes(initialNotes)
    })
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem("loggedNoteappUser")
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      noteService.setToken(user.token)
    }
  }, [])

  const toggleImportanceOf = (id) => {
    const note = notes.find((n) => n.id === id)
    const changedNote = { ...note, important: !note.important }

    noteService
      .update(id, changedNote)
      .then((returnedNote) => {
        setNotes(notes.map((note) => (note.id !== id ? note : returnedNote)))
      })
      .catch((error) => {
        setErrorMessage(`Note ${note.content} was already removed from server`)
        setTimeout(() => {
          setErrorMessage(null)
        }, 5000)
        setNotes(notes.filter((n) => n.id !== id))
      })
  }

  //TODO: refactor to make child component of Toggleable
  const handleLogin = async (event) => {
    event.preventDefault()

    try {
      const user = await loginService.login({
        username,
        password,
      })

      window.localStorage.setItem("loggedNoteappUser", JSON.stringify(user)) //setItem(key, value), removeItem(key),  getItem(key)

      noteService.setToken(user.token)
      setUser(user)
      setUsername("")
      setPassword("")
    } catch (exception) {
      setErrorMessage("Wrong credentials")
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  }

  const handleLogout = () => {
    setUser(null)
    setUsername("")
    setPassword("")
    window.localStorage.removeItem("loggedNoteappUser")
    noteService.setToken(null)
  }

  const loginForm = () => {
    return (
      <Container>
        <Paper
          withBorder
          shadow="xs"
          p="md"
          radius="md"
          style={{ margin: "1em", textAlign: "center" }}
        >
          {!loginVisible && (
            <Button onClick={() => setLoginVisible(true)}>Log in</Button>
          )}
          {loginVisible && (
            <div>
              <LoginForm
                username={username}
                password={password}
                handleUsernameChange={({ target }) => setUsername(target.value)}
                handlePasswordChange={({ target }) => setPassword(target.value)}
                handleSubmit={handleLogin}
              />
              <Group position="center" style={{ marginTop: "1em" }}>
                <Button onClick={() => setLoginVisible(false)}>Cancel</Button>
              </Group>
            </div>
          )}
        </Paper>
      </Container>
    )
  }

  const addNote = (noteObject) => {
    noteFormRef.current.toggleVisibility() // uses ref to call the toggleVisibility method in Togglable component, -- toggle component has to be wrapped in forwardRef and useImperativeHandle to expose functions
    noteService.create(noteObject).then((returnedNote) => {
      setNotes(notes.concat(returnedNote))
    })
  }

  const noteFormRef = useRef()

  const noteForm = () => (
    <Center>
      <Togglable buttonLabel="Add Note" ref={noteFormRef}>
        <NoteForm createNote={addNote} />
      </Togglable>
    </Center>
  )

  const notesToShow = showAll ? notes : notes.filter((note) => note.important)

  return (
    <MantineProvider>
      <div>
        <Container size="lg" style={{ textAlign: Center }}>
          <Title style={{ textAlign: "center", paddingTop: "30px" }}>
            Leave a message!{" "}
          </Title>{" "}
          <Divider my="sm" />
        </Container>

        <Notification message={errorMessage} />

        {!user && loginForm()}
        {user && (
          <Container style={{ textAlign: "center", padding: "20px" }}>
            <Text>{user.username} logged in</Text>
            <Button onClick={handleLogout} style={{ margin: "10px" }}>
              Logout
            </Button>
            {noteForm()}
          </Container>
        )}

        <Center style={{ margin: "20px" }}>
          <Button onClick={() => setShowAll(!showAll)}>
            Show {showAll ? "Important" : "All"}
          </Button>
        </Center>

        <Container>
          <List spacing="md" size="md" center>
            {notesToShow.map((note) => (
              <Note
                key={note.id}
                note={note}
                toggleImportance={() => toggleImportanceOf(note.id)}
              />
            ))}
          </List>
        </Container>
        <Footer />
      </div>
    </MantineProvider>
  )
}

export default App

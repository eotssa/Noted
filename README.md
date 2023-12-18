# Noted

Leave a note in the app. 
https://summer-glitter-2194.fly.dev/

## Technologies Used

- **Backend**: Node.js, Express
- **Frontend**: React
- **Database**: MongoDB (Mongoose ORM)
- **Testing**: Jest (Unit and Integration Testing), Cypress (End-to-End Testing)
- **Styling**: Chakra UI
- **State Management**: Redux
- **Authentication**: JWT
- **Security**: bcrypt for Password Hashing

## Project Structure

### Backend
- `controllers`: Route handlers
- `models`: Mongoose schemas (`blog.js`, `user.js`).
- `utils`: Configuration, middleware, and logging.
- `tests`: Unit and Integration tests.

### Frontend
- `src/components`: UI
- `src/reducers`: Redux Toolkit
- `src/services`: API

## Running the Application

### Backend directory commands
Set environment variables in `.env`
   ```bash
   npm start          # Start server in production mode
   npm run dev        # Start in development mode (nodemon)
   npm run lint       # Lint codebase
   npm test           # Run Jest tests
   npm run start:test # Start server in test environment
   ```

### Frontend directory commands 
   ```bash
   npm run dev          # Start Vite dev server
   npm run build        # Build for production
   npm run preview      # Preview production build
   npm run lint         # Lint frontend code
   npm test             # Run Jest frontend tests
   npm run cypress:open # Open Cypress test runner
   npm run test:e2e     # Run Cypress tests headless
   ```

## Testing
- Backend: Execute `npm test` in the backend directory.


# Cypress Test File

```
describe('Note app', function() {

  beforeEach(function() {
    cy.request('POST', `${Cypress.env('BACKEND')}/testing/reset`)
    const user = {
      name: 'Wilson',
      username: 'admin',
      password: 'admin'
    }
    cy.request('POST', `${Cypress.env('BACKEND')}/users/`, user)
    cy.visit('')  })

  it('front page can be opened', function() {
    cy.contains('Notes')
    cy.contains('Note app, eotssa')
  })

  it('login fails with wrong password', function() {
    cy.contains('log in').click()
    cy.get('#username').type('admin')
    cy.get('#password').type('wrong')
    cy.get('#login-button').click()

    cy.get('.error')
      .should('contain', 'Wrong credentials')
      .and('have.css', 'color', 'rgb(255, 0, 0)')
      .and('have.css', 'border-style', 'solid')

    cy.get('html').should('not.contain', 'admin logged in')
    //cy.contains('admin logged in').should('not.exist')
  })


  it('user can login', function () {
    cy.contains('log in').click()
    cy.get('#username').type('admin')
    cy.get('#password').type('admin')
    cy.get('#login-button').click()

    cy.contains('admin logged in')
  })

  describe('when logged in', function() {
    beforeEach(function() {
      cy.login({ username: 'admin', password: 'admin' })
      cy.createNote({ content: 'first note', important: false })
      cy.createNote({ content: 'second note', important: false })
      cy.createNote({ content: 'third note', important: false })
      cy.createNote({ content: 'another note cypress', important: true })
    })

    it('a new note can be created', function() {
      cy.contains('new note').click()
      cy.get('input').type('a note created by cypress') // TO DO: change 'input' to have a unique id CSS selector
      cy.contains('save').click()
      cy.contains('a note created by cypress')
    })

      it('one of those can be made important', function () {
        cy.contains('second note').parent().find('button').as('theButton')
        cy.get('@theButton').click()
        cy.get('@theButton').should('contain', 'make not important')
      })
    })
  })

```

## Backend TDD 

```
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')

const bcrypt = require('bcrypt')
const User = require('../models/user')

const api = supertest(app)

const Note = require('../models/note')


beforeEach(async () => {
  await Note.deleteMany({})

  const noteObjects = helper.initialNotes
    .map(note => new Note(note))
  const promiseArray = noteObjects.map(note => note.save())
  await Promise.all(promiseArray)
})

describe('when there is initially some notes saved', () => {
  test('notes are returned as json', async () => {
    await api
      .get('/api/notes')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  }, 100000)


  test('all notes are returned', async () => {
    const response = await api.get('/api/notes')


    expect(response.body).toHaveLength(helper.initialNotes.length)
  })


  test('a specific note is within the returned notes', async () => {
    const response = await api.get('/api/notes')


    const contents = response.body.map(r => r.content)
    expect(contents).toContain(
      'Browser can execute only JavaScript'
    )
  })
})


describe('viewing a specific note', () => {
  test('succeeds with a valid id', async () => {
    const notesAtStart = await helper.notesInDb()

    const noteToView = notesAtStart[0]

    const resultNote = await api
      .get(`/api/notes/${noteToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(resultNote.body).toEqual(noteToView)
  })


  test('fails with statuscode 404 if note does not exist', async () => {
    const validNonexistingId = await helper.nonExistingId()

    await api
      .get(`/api/notes/${validNonexistingId}`)
      .expect(404)
  })


  test('fails with statuscode 400 if id is invalid', async () => {
    const invalidId = '5a3d5da59070081a82a3445'

    await api
      .get(`/api/notes/${invalidId}`)
      .expect(400)
  })
})


describe('addition of a new note', () => {
  test('a valid note can be added', async () => {
    const newNote = {
      content: 'async/await simplifies making async calls',
      important: true,
    }

    await api
      .post('/api/notes')
      .send(newNote)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    //const response = await api.get('/api/notes')
    const notesAtEnd = await helper.notesInDb()
    expect(notesAtEnd).toHaveLength(helper.initialNotes.length + 1)

    const contents = notesAtEnd.map(n => n.content)
    expect(contents).toContain(
      'async/await simplifies making async calls'
    )
  })

  test('fails with status code 400 if data invalid (content)', async () => {
    const newNote = {
      important: true
    }

    await api
      .post('/api/notes')
      .send(newNote)
      .expect(400)

    const notesAtEnd = await helper.notesInDb()
    expect(notesAtEnd).toHaveLength(helper.initialNotes.length)
  })
})



describe('deletion of a note', () => {
  test('a note can be deleted', async () => {
    const notesAtStart = await helper.notesInDb()
    const noteToDelete = notesAtStart[0]

    await api
      .delete(`/api/notes/${noteToDelete.id}`)
      .expect(204)

    const notesAtEnd = await helper.notesInDb()

    expect(notesAtEnd).toHaveLength(
      helper.initialNotes.length - 1
    )

    const contents = notesAtEnd.map(r => r.content)

    expect(contents).not.toContain(noteToDelete.content)
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})



describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })


  test('creation fails with proper statuscode and message if username already taken', async() => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root', // root is already taken
      name: 'Superuser',
      password: 'salaien',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('expected `username` to be unique')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toEqual(usersAtStart)

  })
})
```

# backend db controllers

```
const notesRouter = require('express').Router()
const Note = require('../models/note')
const User = require('../models/user')

const jwt = require('jsonwebtoken')



notesRouter.get('/', async (request, response) => {
  const notes = await Note.find({}).populate('user', { username: 1, name: 1 })
  response.json(notes)
})



notesRouter.get('/:id', async (request, response) => {
  const note = await Note.findById(request.params.id)
  if (note) {
    response.json(note)
  } else {
    response.status(404).end()
  }
})


// Helper: isolates the token from the authorization header
const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '')
  }
  return null
}

notesRouter.post('/', async (request, response) => {
  const body = request.body

  // object decoded from token contains the username and id fields
  const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid or missing' })
  }
  const user = await User.findById(decodedToken.id)

  //const user = await User.findById(body.userId)

  const note = new Note({
    content: body.content,
    important: body.important || false,
    user: user.id
  })

  /* try-catch blocks no only required... and exception handling is handled... */
  const savedNote = await note.save()
  user.notes = user.notes.concat(savedNote._id)
  await user.save()

  response.status(201).json(savedNote)
})


notesRouter.delete('/:id', async (request, response) => {
  await Note.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

// findbyIdAndUpdate method

notesRouter.put('/:id', (request, response, next) => {
  //const body = request.body;
  const { content, important } = request.body


    request.params.id,
    { content, important }, // note -> {content, important}}
    { new: true },
    { runValidators: true, context: 'query' }
  )
    .then((updatedNote) => {
      response.json(updatedNote) // updatedNote by default is the original document without the modifications made - new: true returns the modified document
    })
    .catch((error) => next(error))
})



module.exports = notesRouter
```

const express = require('express')
const app = express()
const cors = require('cors')
const morgan = require('morgan')
require('dotenv').config()

const Note = require('./models/note') // Importing the Note model from the models folder

app.use(cors())
app.use(express.static('dist'))
app.use(express.json()) // used for POST
morgan.token('body', (req) => { return JSON.stringify(req.body)})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}


//Handler to fetch all notes
app.get('/api/notes', (request, response) => {
  Note.find({}).then((notes) => {
    response.json(notes)
  })
})

// four parameters are needed to define an error handling middleware that express expects
// 1. Checks for CastErrors exceptions sends a response to the browser with the response object passed as a parameter
//    Else, the middleware is forwarded to the default Express error handler, which sends an Internal Server Error (500) response to the browser.
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}


// const generateId = () => {
//   const maxId = notes.length > 0 ? Math.max(...notes.map((n) => n.id)) : 0
//   return maxId + 1
// }

app.post('/api/notes', (request, response, next) => {
  const body = request.body

  if (body.content === undefined) {
    return response.status(400).json({ error: 'content missing' })
  }

  const note = new Note({
    content: body.content,
    important: body.important || false,
    date: new Date(),
  })

  note.save()
    .then(savedNote => {
      response.json(savedNote) // data sent back in the response is formatted from the toJSON method in the noteSchema
    })
    .catch(error => next(error)) // next without a parameter moves to the next route or middleware. next with a parameter moves to the error handler.
})

// Mongoose findById
app.get('/api/notes/:id', (request, response, next) => {
  Note.findById(request.params.id)
    .then(note => {
      if (note) {
        response.json(note)
      } else {
        response.status(404).end()
      }
    })
    .catch((error) => next(error)) // next without a parameter moves to the next route or middleware. next with a parameter moves to the error handler.
    //console.log(error)

  //response.status(400).send({ error: "malformatted id" })  // incorrect format. client should not repeat the request until changed
})

// findByIdAndRemove method -- deprecated -- it's findbyIdAndDelete v 5.7.0 and later
// TODO: there exists two cases: deleting a note that exists and deleting a note that does not exist -- should return different status codes.
app.delete('/api/notes/:id', (request, response, next) => {
  Note.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end() // 204 No Content status code indicates operation succeeded and that there is no content to send in the response payload body
    })
    .catch(error => next(error))
})

// findbyIdAndUpdate method

app.put('/api/notes/:id', (request, response, next) => {
  //const body = request.body;
  const { content, important } = request.body

  // just recieves the regular updated note as a parameter (not the Note constructor function)
  // by default, mongoose does not run validators on update operations:
  // FIXED: https://github.com/mongoose-unique-validator/mongoose-unique-validator#find--updates
  Note.findByIdAndUpdate(
    request.params.id,
    { content, important }, // note -> {content, important}}
    { new: true },
    { runValidators: true, context: 'query' }
  ) // new: true returns the new modified document instead of the original document
    .then((updatedNote) => {
      response.json(updatedNote) // updatedNote by default is the original document without the modifications made - new: true returns the modified document
    })
    .catch((error) => next(error))
})


app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})


// deloying to fly.io - set fly secrets set MONGO_URI=<your-mongo-uri>
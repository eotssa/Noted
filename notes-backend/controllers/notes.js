const notesRouter = require('express').Router()
const Note = require('../models/note')
const User = require('../models/user')

const jwt = require('jsonwebtoken')



notesRouter.get('/', async (request, response) => {
  const notes = await Note.find({}).populate('user', { username: 1, name: 1 })
  response.json(notes)
})


// Mongoose findById
// notesRouter.get('/:id', (request, response, next) => {
//   Note.findById(request.params.id)
//     .then(note => {
//       if (note) {
//         response.json(note)
//       } else {
//         response.status(404).end()
//       }
//     })
//     .catch((error) => next(error)) // next without a parameter moves to the next route or middleware. next with a parameter moves to the error handler.
// })

notesRouter.get('/:id', async (request, response) => {
  const note = await Note.findById(request.params.id)
  if (note) {
    response.json(note)
  } else {
    response.status(404).end()
  }
})


// notesRouter.post('/', async (request, response, next) => {
//   const body = request.body

//   if (body.content === undefined) {
//     return response.status(400).json({ error: 'content missing' })
//   }

//   const note = new Note({
//     content: body.content,
//     important: body.important || false,
//   })

//   try {
//     const savedNote = await note.save()
//     response.status(201).json(savedNote)
//   } catch(exception) {
//     next(exception)
//   }

// })

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


// findByIdAndRemove method -- deprecated -- it's findbyIdAndDelete v 5.7.0 and later
// notesRouter.delete('/:id', (request, response, next) => {
//   Note.findByIdAndDelete(request.params.id)
//     .then(() => {
//       response.status(204).end() // 204 No Content status code indicates operation succeeded and that there is no content to send in the response payload body
//     })
//     .catch(error => next(error))
// })

// notesRouter.delete('/:id', async (request, response, next) => {
//   try {
//     await Note.findByIdAndDelete(request.params.id)
//     response.status(204).end()
//   } catch(exception) {
//     next(exception)
//   }
// })

// After express-async errors middleware
/* next(exception) is no longer required. Exceptions that occur
 * in async routes are automatically passed to error handling middleware */
notesRouter.delete('/:id', async (request, response) => {
  await Note.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

// findbyIdAndUpdate method

notesRouter.put('/:id', (request, response, next) => {
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



module.exports = notesRouter
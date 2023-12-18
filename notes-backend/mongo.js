const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url =
  `mongodb+srv://eotssa:${password}@cluster0.ze8cmhl.mongodb.net/testNoteApp?retryWrites=true&w=majority`

mongoose.set('strictQuery',false)
mongoose.connect(url)


// Defines structure for the notes collection, a scheme is "structure" given to a MongoDB -- since MonogoDB is schemaless.
// The schema is used to validate the data that is inserted into the database.
// The schema is also used to cast the data retrieved from the database into the correct type.
// We can still insert data that does not conform to the scheme, but at the application level, it won't be aware of the extra fields.
// Effectively, it defines structure that your application can rely on.
const noteSchema = new mongoose.Schema({
  content: String,
  important: Boolean,
})


// Creates a model class, uses the scheme as a "constructor" for the model.
const Note = mongoose.model('Note', noteSchema)


// Create and save objects
// Note models are 'constructor functions' that create new JS objects based on provided parameters.

const note = new Note({
  content: 'We used old script to add a note number 2',
  important: true,
})


// Must close connection after saving, otherwise the program will not terminate.
note.save().then(() => {
  console.log('note saved!')
  mongoose.connection.close()
})

//Fetching objects from the database
// {} as the parameter to find means that all documents are returned.
Note.find({}).then(result => {
  result.forEach(note => {
    console.log(note)
  })
  mongoose.connection.close()
})

// Filtering objects
// Note.find({ important: true }).then(result => {
//     result.forEach(note => {
//         console.log(note)
//     })
//     mongoose.connection.close()
// })

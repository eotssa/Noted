require('dotenv').config()
const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan");
const Note = require('./models/note') // Importing the Note model from the models folder


const mongoose = require("mongoose");

// DO NOT SAVE YOUR PASSWORD TO GITHUB!!
const url = `mongodb+srv://eotssa:${process.env.DB_PASSWORD}@cluster0.ze8cmhl.mongodb.net/noteApp?retryWrites=true&w=majority`


mongoose.set("strictQuery", false);
mongoose.connect(url);

const noteSchema = new mongoose.Schema({
  content: String,
  important: Boolean,
});

// TODO: We also don't want to return the mongo versioning field __v to the frontend.
// Removes __v field, and changes _id (which is an object) to a string, to be safe. -- important for testing.
noteSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Note = mongoose.model("Note", noteSchema);

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(cors());
app.use(express.json()); // used for POST
app.use(express.static("dist"));
morgan.token("body", (req) => {
  return JSON.stringify(req.body);
});
// Followed a specified parameter, used :body token.
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

let notes = [
  {
    id: 1,
    content: "HTML is easy",
    important: true,
  },
  {
    id: 2,
    content: "Browser can execute only JavaScript",
    important: false,
  },
  {
    id: 3,
    content: "GET and POST are the most important methods of HTTP protocol",
    important: true,
  },
];

app.get("/", (req, res) => {
  res.send("<h1>Hello World!</h1>");
});

//Handler to fetch all notes
app.get("/api/notes", (request, response) => {
  Note.find({}).then((notes) => {
    response.json(notes);
  });
});

const generateId = () => {
  const maxId = notes.length > 0 ? Math.max(...notes.map((n) => n.id)) : 0;
  return maxId + 1;
};

app.post("/api/notes", (request, response) => {
  const body = request.body;

  if (body.content === undefined) {
    return response.status(400).json({ error: 'content missing' })
  }

  const note = new Note({
    content: body.content,
    important: body.important || false,
  })

  note.save().then(savedNote => { // data saved is then used in a callback function
    response.json(savedNote)  // data sent back in the response is formatted from the toJSON method in the noteSchema
  })
});


// Mongoose findById 
app.get("/api/notes/:id", (request, response) => {
  const id = Number(request.params.id);
  const note = notes.find((note) => note.id === id);

  if (note) {
    response.json(note);
  } else {
    response.status(404).end();
  }
});

app.delete("/api/notes/:id", (request, response) => {
  const id = Number(request.params.id);
  notes = notes.filter((note) => note.id !== id);

  response.status(204).end();
});

// PUT SPECIFIC ID -- changing importance
app.put("/api/notes/:id", (request, response) => {
  const id = Number(request.params.id);
  const body = request.body;

  // If the body does not contain content, return an error
  if (!body.content) {
    return response.status(400).json({
      error: "content missing",
    });
  }

  const note = {
    content: body.content,
    important: body.important,
    id: id,
  };

  // Use map to create a new array by replacing the note with the matching id
  notes = notes.map((n) => (n.id !== id ? n : note));

  response.json(note);
});

app.use(unknownEndpoint);

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

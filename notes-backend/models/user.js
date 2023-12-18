const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')


// TODO: implement username length, username permitted characters, password strength
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  name: String,
  passwordHash: String,
  notes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Note'
    }
  ],
})

userSchema.plugin(uniqueValidator)

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString() // Change _id to id
    delete returnedObject._id
    delete returnedObject.__v
    delete returnedObject.passwordHash // Delete passwordHash -- don't reveal
  }
})

const User = mongoose.model('User', userSchema)

module.exports = User
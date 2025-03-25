const mongoose = require('mongoose');

const notesSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    color: {
        type: String,
        default: "#FBEB95"
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: String,
        default: new Date().toISOString()
    }
});

const Note = mongoose.model('Notes', notesSchema);
module.exports = Note;
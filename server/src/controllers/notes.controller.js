const Note = require('../models/notes.model');

async function createNote(req, res) {
    try {
        const { text, color } = req.body;
        const newNote = new Note({
            text,
            color,
            userId: req.usertoken.id,
        });

        await newNote.save();
        res.status(201).json(newNote);
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

async function getNote(req, res) {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        } else {
            res.status(200).json(note);
        }
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

async function getAllNotes(req, res) {
    try {
        const notes = await Note.find({ userId: req.usertoken.id, isDeleted: false });
        res.status(200).json(notes);
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

async function updateNote(req, res) {
    try {
        const { id, text, color } = req.body;
        const note = await Note.findById(id);

        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        if (note.userId.toString() !== req.usertoken.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const updatedNote = await Note.findByIdAndUpdate(
            id,
            { text, color, updatedAt: new Date().toISOString() },
            { new: true }
        );

        res.status(200).json(updatedNote);
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

async function deleteNote(req, res) {
    try {
        const { id } = req.query;
        const note = await Note.findById(id);

        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        if (note.userId.toString() !== req.usertoken.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await Note.findByIdAndUpdate(id, { isDeleted: true });
        res.status(200).json({ message: 'Note deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

module.exports = {
    createNote,
    getNote,
    getAllNotes,
    updateNote,
    deleteNote
};